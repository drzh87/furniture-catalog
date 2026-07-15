import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div>Загрузка…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
