import { CalendarDays, MapPin, Tag } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BookingPanel } from '@/features/events/booking-panel';
import { getEvent } from '@/features/events/event.api';

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailsPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEvent(id).catch(() => null);
  if (!event) notFound();

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-300"><Tag className="h-4 w-4" />{event.category}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{event.title}</h1>
            <div className="mt-6 grid gap-3 text-slate-300 sm:grid-cols-2">
              <p className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-rose-300" />{new Date(event.startsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p className="flex items-center gap-2"><MapPin className="h-5 w-5 text-emerald-300" />{event.venue}, {event.city}</p>
            </div>
          </div>
          <div className="aspect-[16/11] overflow-hidden rounded-2xl">
            <div className="relative h-full w-full">
              <Image src={event.imageUrl} alt={event.title} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">About this event</h2>
          <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{event.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-muted-foreground">City</p>
              <p className="mt-1 font-semibold">{event.city}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-muted-foreground">Venue</p>
              <p className="mt-1 font-semibold">{event.venue}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="mt-1 font-semibold">{event.category}</p>
            </div>
          </div>
        </article>
        <BookingPanel event={event} />
      </section>
    </div>
  );
}
