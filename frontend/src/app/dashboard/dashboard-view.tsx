'use client';

import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DashboardPageSkeleton } from '@/components/common/loading-skeletons';
import { Button } from '@/components/ui/button';
import { getBookings } from '@/features/events/event.api';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function DashboardView() {
  const { data, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: getBookings });

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Your bookings</h1>
        </div>
        <Button asChild variant="outline"><Link href="/">Find events</Link></Button>
      </div>
      {data?.length ? (
        <div className="space-y-4">
          {data.map((booking) => (
            <article key={booking.id} className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[180px_1fr_auto]">
              <img src={booking.event.imageUrl} alt={booking.event.title} className="aspect-[16/10] rounded-xl object-cover" />
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-800">{booking.status}</span>
                <h2 className="mt-3 text-xl font-semibold">{booking.event.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />{new Date(booking.event.startsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{booking.event.venue}, {booking.event.city}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-semibold">{currency.format(booking.totalAmount)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{booking.quantity} × {booking.tierName}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">No bookings yet</h2>
          <p className="mt-2 text-muted-foreground">When you book an event, it appears here with status and payment details.</p>
        </div>
      )}
    </div>
  );
}
