# План файлов — Каталог мебели

## Структура проекта

```
furniture-catalog/
├── supabase/
│   └── migrations/
│       └── 001_catalog_schema.sql          ✅ готово
├── .env.example                             ✅ готово
├── next.config.mjs                          — webpack alias для pdfjs/canvas
├── package.json                             — зависимости (см. ниже)
├── tailwind.config.ts                       — кастомные цвета каталога
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                       — шрифт, meta, общий layout
│   │   ├── page.tsx                         — публичный каталог (Server Component)
│   │   ├── globals.css                      — Tailwind + модалка/чипы
│   │   │
│   │   ├── api/
│   │   │   ├── catalog/
│   │   │   │   └── route.ts                 — GET: товары без supplier_* (фильтр/поиск)
│   │   │   ├── admin/
│   │   │   │   ├── pdf/
│   │   │   │   │   └── process/route.ts     — POST: PDF → preview items (base64 + text)
│   │   │   │   ├── products/
│   │   │   │   │   └── route.ts             — POST bulk save, GET list (admin)
│   │   │   │   ├── products/[id]/
│   │   │   │   │   └── route.ts             — DELETE one product
│   │   │   │   ├── suppliers/
│   │   │   │   │   └── route.ts             — GET list, POST create
│   │   │   │   └── suppliers/[id]/products/
│   │   │   │       └── route.ts             — DELETE all products by supplier
│   │   │   └── auth/
│   │   │       └── callback/route.ts        — Supabase Auth callback
│   │   │
│   │   └── admin/
│   │       ├── layout.tsx                   — проверка сессии, редирект на login
│   │       ├── login/page.tsx               — форма email/password
│   │       └── page.tsx                     — upload + preview + product list
│   │
│   ├── components/
│   │   ├── catalog/
│   │   │   ├── CategoryFilter.tsx           — чипы категорий
│   │   │   ├── SearchBar.tsx                — поиск артикул/описание
│   │   │   ├── ProductGrid.tsx              — сетка карточек
│   │   │   ├── ProductCard.tsx              — фото lazy, артикул, описание
│   │   │   └── ProductModal.tsx             — модалка с крупным фото
│   │   └── admin/
│   │       ├── UploadForm.tsx               — supplier + category + PDF file
│   │       ├── PreviewList.tsx              — редактируемые артикул/описание, удаление страниц
│   │       ├── ProductTable.tsx             — список товаров, фильтр по поставщику
│   │       └── SupplierSelect.tsx           — dropdown + «новый поставщик»
│   │
│   ├── lib/
│   │   ├── types/catalog.ts                 ✅ готово
│   │   ├── constants/categories.ts          ✅ готово
│   │   ├── supabase/
│   │   │   ├── client.ts                    ✅ готово
│   │   │   ├── server.ts                    ✅ готово
│   │   │   └── admin.ts                     ✅ готово
│   │   ├── catalog/
│   │   │   └── public-mapper.ts             ✅ готово — strip supplier fields
│   │   ├── pdf/
│   │   │   ├── process-pdf.ts               — pdfjs-dist: render pages → PNG
│   │   │   ├── extract-text.ts              — getTextContent / pdf-parse fallback
│   │   │   └── parse-article.ts             — ARTICLE_REGEX heuristic
│   │   └── utils/
│   │       ├── slug.ts                      — slugify supplier name
│   │       └── auth-guard.ts                — requireAdmin() для API routes
│   │
│   └── middleware.ts                        — защита /admin/* (кроме /admin/login)
```

## Зависимости (package.json)

| Пакет | Назначение |
|-------|------------|
| `@supabase/supabase-js` | Admin client |
| `@supabase/ssr` | Auth cookies в Next.js |
| `pdfjs-dist` | Рендер страниц PDF → canvas → PNG |
| `canvas` | Node canvas для pdfjs на сервере |
| `pdf-parse` | Fallback извлечения текста |

## Потоки данных

### Публичный каталог
```
Browser → GET /api/catalog?category=&q=
       ← JSON PublicProduct[] (без supplier_id, supplier.name)
       
Server: SELECT id, category, article, description, image_url, page_number, created_at
        FROM catalog_products WHERE ...
        → toPublicProducts()
```

### Загрузка PDF (админ)
```
Admin UI → POST /api/admin/pdf/process (multipart: pdf file)
        ← { items: PdfExtractedItem[], warnings: string[] }

Admin UI → правки в PreviewList → POST /api/admin/products
        { supplierId, category, sourcePdfName, items[] }
        
API (service role):
  1. decode base64 → upload to product-images/{uuid}.webp
  2. INSERT catalog_products (supplier_id NOT NULL)
```

### Изоляция поставщиков
- `supplier_id` NOT NULL + FK на уровне БД
- Публичный SELECT явно перечисляет колонки (без join на suppliers)
- `toPublicProduct()` — единственная точка маппинга для клиента
- Один PDF → один `supplier_id` + одна `category` на все страницы

## Supabase — что сделать вручную

1. **SQL Editor** → выполнить `supabase/migrations/001_catalog_schema.sql`
2. **Storage** → проверить bucket `product-images` (public read)
3. **Auth** → создать пользователя (email/password) для /admin
4. **Vercel** → env vars из `.env.example`

## Деплой

1. Отдельный репозиторий `drzh87/furniture-catalog` (или аналог)
2. Vercel: Import → Root Directory `furniture-catalog` если монорепо, или корень репо
3. Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Этапы реализации (после утверждения плана)

1. **Этап 1** — API каталога + UI главной (сетка, фильтры, модалка)
2. **Этап 2** — Auth + middleware + /admin/login
3. **Этап 3** — PDF processing API + preview UI
4. **Этап 4** — Bulk save + admin product table + delete actions
5. **Этап 5** — GitHub repo + Vercel deploy + smoke test
