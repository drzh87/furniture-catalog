import { CatalogView } from '@/components/catalog/CatalogView';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Каталог мебели
          </h1>
          <Link
            href="/admin"
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            Админ
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <CatalogView />
      </main>
    </>
  );
}
