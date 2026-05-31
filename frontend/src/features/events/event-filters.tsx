'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    ['search', 'city', 'category', 'date'].forEach((key) => {
      const value = String(formData.get(key) || '').trim();
      if (value) params.set(key, value);
    });
    router.push(`/${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.14)] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
      <Input name="search" defaultValue={searchParams.get('search') || ''} placeholder="Search events" />
      <Input name="city" defaultValue={searchParams.get('city') || ''} placeholder="City" />
      <Input name="category" defaultValue={searchParams.get('category') || ''} placeholder="Category" />
      <Input name="date" defaultValue={searchParams.get('date') || ''} type="date" />
      <Button className="gap-2"><Search className="h-4 w-4" />Search</Button>
    </form>
  );
}
