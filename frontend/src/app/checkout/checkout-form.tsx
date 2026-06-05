'use client';

import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/use-auth';
import { createBooking } from '@/features/events/event.api';
import { Event, TicketTier } from '@/types/event';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function CheckoutForm({ event, tier, quantity }: { event: Event; tier: TicketTier; quantity: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = useMemo(() => Number(tier.price) * quantity, [tier.price, quantity]);

  async function onSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError('');
    setIsSubmitting(true);
    const formData = new FormData(formEvent.currentTarget);

    try {
      await createBooking({
        eventId: event.id,
        ticketTierId: tier.id,
        quantity,
        attendeeName: String(formData.get('name')),
        attendeeEmail: String(formData.get('email'))
      });
      setIsDone(true);
      setTimeout(() => router.push('/dashboard'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place booking');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          <h1 className="text-2xl font-bold">Booking confirmed</h1>
          <p className="text-muted-foreground">Your mock payment was accepted and the ticket is in your dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input name="name" defaultValue={user?.name || ''} placeholder="Full name" required />
            <Input name="email" type="email" defaultValue={user?.email || ''} placeholder="Email" required />
            <div className="rounded-xl border bg-emerald-50 p-4 text-sm text-emerald-900">Payment is mocked for this demo. Placing the order confirms your booking immediately.</div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Placing order' : 'Place order'}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
            <Image src={event.imageUrl} alt={event.title} fill sizes="360px" className="object-cover" />
          </div>
          <div>
            <h2 className="font-semibold">{event.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tier.name} · {quantity} ticket{quantity > 1 ? 's' : ''}</p>
          </div>
          <div className="flex justify-between border-t pt-4 font-semibold">
            <span>Total</span>
            <span>{currency.format(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
