'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ChevronDown, Menu, MessageCircle, Search, ShoppingCart, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

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
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-component-sm px-layout-sm py-component-sm">
        <BrandLogo />
        <form onSubmit={onSubmit} className="relative min-w-0 flex-1">
          <Search className="absolute left-component-md top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for Products, Brands and More"
            className="h-control-lg w-full rounded-2xl border border-input bg-muted pl-layout-xl pr-component-md text-body-sm outline-none ring-ring transition focus:bg-card focus:ring-2"
          />
        </form>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href={user ? '/profile' : '/login'} className="flex h-control-lg items-center gap-component-xs rounded-2xl px-component-sm text-body-sm font-semibold hover:bg-muted">
            <UserRound className="h-4 w-4" />
            {user?.name || 'Profile'}
            <ChevronDown className="h-4 w-4" />
          </Link>
          {user ? (
            <Link href="/chat" className="flex h-control-lg items-center gap-component-xs rounded-2xl px-component-sm text-body-sm font-semibold hover:bg-muted">
              <MessageCircle className="h-4 w-4" />
              Chat
            </Link>
          ) : null}
          <Link href="/cart" className="relative flex h-control-lg items-center gap-component-xs rounded-2xl px-component-sm text-body-sm font-semibold hover:bg-muted">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {count > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-primary px-component-xs text-body-xs text-primary-foreground">{count}</span> : null}
          </Link>
          <button
            type="button"
            onClick={() => (user ? logout.mutate() : router.push('/register'))}
            className="flex h-control-lg items-center gap-component-xs rounded-2xl px-component-sm text-body-sm font-semibold hover:bg-muted"
          >
            <Menu className="h-4 w-4" />
            {user ? 'Logout' : 'More'}
          </button>
        </div>
      </div>
    </header>
  );
}
