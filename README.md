# Каталог мебели

Сайт-каталог товаров: поставщики загружаются через PDF, клиенты просматривают каталог по категориям.

**Стек:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Storage + Auth), Vercel.

## Быстрый старт

```bash
cd furniture-catalog
cp .env.example .env.local
# заполните ключи Supabase (проект nkjwbocqbncvkxjwtgqq)
npm install
npm run dev
```

## Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard/project/nkjwbocqbncvkxjwtgqq/sql) → SQL Editor
2. Выполните скрипт `supabase/migrations/001_catalog_schema.sql`
3. Создайте пользователя в Authentication для входа в `/admin`

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (публичный) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (только сервер, загрузка в Storage) |

## План файлов

См. [FILE_PLAN.md](./FILE_PLAN.md) — полная структура и этапы реализации.

## Изоляция данных Fabrica

Все таблицы с префиксом `catalog_` — отдельно от CRM Fabrica в том же Supabase-проекте.
