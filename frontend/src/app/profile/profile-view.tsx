'use client';

import Link from 'next/link';
import { ProfilePageSkeleton } from '@/components/common/loading-skeletons';
import { useAuth } from '@/hooks/useAuth';

export function ProfileView() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <ProfilePageSkeleton />;
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold">Login to view profile</h1>
          <Link href="/login" className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 font-semibold text-white">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-blue-700">Profile</p>
        <h1 className="mt-2 text-3xl font-bold">{user.name}</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Role</p>
            <p className="font-semibold capitalize">{user.role}</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/orders" className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">Orders</Link>
          <Link href="/cart" className="rounded-xl border px-5 py-3 font-semibold">Cart</Link>
        </div>
      </section>
    </div>
  );
}
