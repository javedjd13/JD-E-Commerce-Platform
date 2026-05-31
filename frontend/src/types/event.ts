export type TicketTier = {
  id: string;
  name: string;
  price: number | string;
  capacity: number;
  available: number;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  city: string;
  venue: string;
  category: string;
  startsAt: string;
  imageUrl: string;
  minPrice: number;
  tiers?: TicketTier[];
};

export type Booking = {
  id: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  tierName: string;
  event: Pick<Event, 'id' | 'title' | 'city' | 'venue' | 'startsAt' | 'imageUrl'>;
};
