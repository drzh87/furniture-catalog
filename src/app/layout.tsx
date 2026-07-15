import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Каталог мебели',
  description: 'Каталог мебели по категориям',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Каталог мебели',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#1c1917',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased bg-stone-50 text-stone-900 font-sans">
        {children}
      </body>
    </html>
  );
}
