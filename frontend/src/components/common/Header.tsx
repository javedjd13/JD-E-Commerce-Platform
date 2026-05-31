'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ChevronDown, Menu, Search, ShoppingCart, Store, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';

export function Header() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const count = useAppSelector((state) => state.cart.count);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex h-11 items-center gap-2 rounded-2xl bg-yellow-300 px-4 font-extrabold text-blue-700">
          <Store className="h-5 w-5" />
          NovaCart
        </Link>
        <form onSubmit={onSubmit} className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for Products, Brands and More"
            className="h-11 w-full rounded-2xl border border-blue-200 bg-blue-50 pl-11 pr-4 text-sm outline-none ring-blue-400 transition focus:bg-white focus:ring-2"
          />
        </form>
        <div className="hidden items-center gap-2 md:flex">
          <Link href={user ? '/profile' : '/login'} className="flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold hover:bg-slate-100">
            <UserRound className="h-4 w-4" />
            {user?.name || 'Profile'}
            <ChevronDown className="h-4 w-4" />
          </Link>
          <Link href="/cart" className="relative flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold hover:bg-slate-100">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {count > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 text-xs text-white">{count}</span> : null}
          </Link>
          <button
            type="button"
            onClick={() => (user ? logout.mutate() : router.push('/register'))}
            className="flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold hover:bg-slate-100"
          >
            <Menu className="h-4 w-4" />
            {user ? 'Logout' : 'More'}
          </button>
        </div>
      </div>
    </header>
  );
}
