import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Event } from '@/types/event';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden border-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <Image src={event.imageUrl} alt={event.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover transition-transform duration-300 hover:scale-105" />
      </div>
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{event.category}</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug">{event.title}</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(event.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.city} · {event.venue}</p>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><Ticket className="h-4 w-4 text-rose-600" />From {currency.format(event.minPrice)}</p>
          <Button asChild size="sm">
            <Link href={`/events/${event.id}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
