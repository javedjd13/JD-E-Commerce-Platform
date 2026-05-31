'use client';

import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Event, TicketTier } from '@/types/event';
import { cn } from '@/utils/cn';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function BookingPanel({ event }: { event: Event }) {
  const router = useRouter();
  const tiers = event.tiers || [];
  const [tier, setTier] = useState<TicketTier | undefined>(tiers[0]);
  const [quantity, setQuantity] = useState(1);
  const total = useMemo(() => Number(tier?.price || 0) * quantity, [tier, quantity]);

  function checkout() {
    if (!tier) return;
    router.push(`/checkout?eventId=${event.id}&tierId=${tier.id}&quantity=${quantity}`);
  }

  return (
    <aside className="rounded-2xl border bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
      <h2 className="text-lg font-semibold">Choose tickets</h2>
      <div className="mt-4 space-y-3">
        {tiers.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTier(item)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border p-4 text-left transition',
              tier?.id === item.id ? 'border-rose-500 bg-rose-50' : 'hover:border-slate-400'
            )}
          >
            <span>
              <span className="block font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground">{item.available} left</span>
            </span>
            <span className="font-semibold">{currency.format(Number(item.price))}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary p-3">
        <span className="font-medium">Quantity</span>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></Button>
          <span className="w-6 text-center font-semibold">{quantity}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.min(10, quantity + 1))} aria-label="Increase quantity"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{currency.format(total)}</span>
      </div>
      <Button className="mt-5 w-full" size="lg" onClick={checkout} disabled={!tier}>Book Now</Button>
    </aside>
  );
}
