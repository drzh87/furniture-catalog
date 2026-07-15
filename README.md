# Каталог мебели

Сайт-каталог товаров: поставщики загружаются через PDF, клиенты просматривают каталог по категориям.

**Стек:** Next.js 14, TypeScript, Tailwind CSS, Supabase, Vercel.

## Репозиторий

Отдельный проект (не Fabrica). После создания на GitHub:

```bash
git remote add origin https://github.com/drzh87/furniture-catalog.git
git push -u origin main
```

## Быстрый старт

```bash
cp .env.example .env.local
# заполните ключи Supabase (проект nkjwbocqbncvkxjwtgqq)
npm install
npm run dev
```

## Supabase

1. [SQL Editor](https://supabase.com/dashboard/project/nkjwbocqbncvkxjwtgqq/sql) → выполнить `supabase/migrations/001_catalog_schema.sql`
2. **Authentication** → создать пользователя (email/password) для `/admin/login`
3. **Storage** → bucket `product-images` (создаётся миграцией)

## Vercel

1. [Import project](https://vercel.com/new) → репозиторий `drzh87/furniture-catalog`
2. Environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy

## Маршруты

| URL | Описание |
|-----|----------|
| `/` | Публичный каталог |
| `/admin/login` | Вход |
| `/admin` | Загрузка PDF, предпросмотр, управление товарами |

## Изоляция от Fabrica

Таблицы `catalog_*` в том же Supabase-проекте, но отдельно от CRM.

План файлов: [FILE_PLAN.md](./FILE_PLAN.md)
