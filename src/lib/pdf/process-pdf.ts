import { createCanvas } from '@napi-rs/canvas';
import { PDF_MAX_BYTES, PDF_MAX_PAGES } from '@/lib/constants/categories';
import type { PdfExtractedItem } from '@/lib/types/catalog';
import { extractArticle, extractDescription } from '@/lib/pdf/parse-article';

type PdfJsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

let pdfjsLib: PdfJsModule | null = null;

async function getPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return pdfjsLib;
}

function randomId(): string {
  return crypto.randomUUID();
}

export type ProcessPdfResult = {
  items: PdfExtractedItem[];
  warnings: string[];
  sourcePdfName: string;
};

export async function processPdfBuffer(
  buffer: Buffer,
  sourcePdfName: string,
): Promise<ProcessPdfResult> {
  const warnings: string[] = [];

  if (buffer.byteLength > PDF_MAX_BYTES) {
    throw new Error(`PDF больше ${PDF_MAX_BYTES / 1024 / 1024} МБ`);
  }

  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  });

  const pdf = await loadingTask.promise;

  if (pdf.numPages > PDF_MAX_PAGES) {
    warnings.push(
      `В PDF ${pdf.numPages} страниц — больше рекомендуемого лимита (${PDF_MAX_PAGES}). Обработка может занять время.`,
    );
  }

  const items: PdfExtractedItem[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const textContent = await page.getTextContent();
    const rawText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const article = extractArticle(rawText);
    const description = extractDescription(rawText, article);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

    const pngBuffer = canvas.toBuffer('image/png');
    const imageBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    items.push({
      tempId: randomId(),
      pageNumber: pageNum,
      imageBase64,
      rawText,
      article,
      description,
    });
  }

  return { items, warnings, sourcePdfName };
}
