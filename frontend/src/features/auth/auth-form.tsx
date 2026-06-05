'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [error, setError] = useState('');
  const isRegister = mode === 'register';
  const mutation = isRegister ? register : login;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      password: String(form.get('password') || '')
    };

    try {
      if (isRegister) {
        await register.mutateAsync(payload);
      } else {
        await login.mutateAsync({ email: payload.email, password: payload.password });
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-8">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-card p-8 text-card-foreground shadow-sm ring-1 ring-border">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">NexaMart account</p>
        <h1 className="mt-2 text-3xl font-bold">{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <div className="mt-6 space-y-4">
          {isRegister ? <input name="name" required placeholder="Name" className="h-12 w-full rounded-xl border px-3" /> : null}
          <input name="email" required type="email" placeholder="Email" className="h-12 w-full rounded-xl border px-3" />
          <input name="password" required type="password" placeholder="Password" className="h-12 w-full rounded-xl border px-3" />
        </div>
        {error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/60">{error}</p> : null}
        <button disabled={mutation.isPending} className="mt-6 h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:opacity-60">
          {mutation.isPending ? 'Please wait' : isRegister ? 'Register' : 'Login'}
        </button>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isRegister ? 'Already registered?' : 'New to NexaMart?'}{' '}
          <Link href={isRegister ? '/login' : '/register'} className="font-bold text-blue-700 dark:text-blue-300">
            {isRegister ? 'Login' : 'Create account'}
          </Link>
        </p>
      </form>
    </div>
  );
}
