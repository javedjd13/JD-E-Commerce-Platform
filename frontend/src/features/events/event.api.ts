import { apiClient } from '@/services/api-client';
import { serverApi } from '@/services/server-api';
import { Booking, Event } from '@/types/event';

export type EventFilters = {
  city?: string;
  category?: string;
  date?: string;
  search?: string;
};

function toQuery(filters: EventFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getEvents(filters?: EventFilters) {
  return serverApi<Event[]>(`/events${toQuery(filters)}`, { cache: 'no-store' });
}

export function getEvent(id: string) {
  return serverApi<Event>(`/events/${id}`, { cache: 'no-store' });
}

export function getBookings() {
  return apiClient<Booking[]>('/bookings', { auth: true });
}

export type CreateBookingInput = {
  eventId: string;
  ticketTierId: string;
  quantity: number;
  attendeeName: string;
  attendeeEmail: string;
};

export function createBooking(input: CreateBookingInput) {
  return apiClient<{ id: string; status: string; totalAmount: number }>('/bookings', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input)
  });
}
