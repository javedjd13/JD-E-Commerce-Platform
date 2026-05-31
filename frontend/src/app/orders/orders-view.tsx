'use client';

import { Search, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrdersPageSkeleton } from '@/components/common/loading-skeletons';
import { getOrders } from '@/features/cart/cart.api';
import { currency } from '@/lib/api';
import { Order } from '@/types/order';

const statusFilters = ['On the way', 'Delivered', 'Cancelled', 'Returned'];
const timeFilters = ['Last 30 days', '2024', '2023', 'Older'];

export function OrdersView() {
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const { data, isLoading, error } = useQuery({ queryKey: ['orders'], queryFn: getOrders, retry: false });

  const orders = useMemo(() => {
    const allOrders = data?.orders || [];
    return allOrders.filter((order) => {
      const firstItem = order.items[0];
      const text = [order.id, firstItem?.product.title, firstItem?.product.category, order.status].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const normalizedStatus = getStatusLabel(order).toLowerCase();
      const matchesStatus = !selectedStatuses.length || selectedStatuses.some((status) => normalizedStatus.includes(status.toLowerCase()));
      const matchesTime = !selectedTimes.length || matchesTimeFilter(order, selectedTimes);
      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [data?.orders, search, selectedStatuses, selectedTimes]);

  if (isLoading) return <OrdersPageSkeleton />;
  if (error) return <Prompt />;

  return (
    <div className="bg-slate-100 px-5 py-7">
      <div className="mx-auto max-w-[1850px]">
        <Breadcrumb />
        <div className="mt-3 grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded bg-white shadow-sm ring-1 ring-slate-200">
            <h1 className="border-b px-5 py-4 text-2xl font-bold text-slate-950">Filters</h1>
            <FilterGroup title="ORDER STATUS" values={statusFilters} selected={selectedStatuses} onChange={setSelectedStatuses} />
            <FilterGroup title="ORDER TIME" values={timeFilters} selected={selectedTimes} onChange={setSelectedTimes} />
          </aside>

          <main>
            <div className="flex">
              <input
                className="h-12 flex-1 rounded-l border border-slate-300 bg-white px-4 text-lg outline-none focus:border-blue-600"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your orders here"
                value={search}
              />
              <button className="inline-flex h-12 items-center gap-3 rounded-r bg-blue-600 px-8 font-bold text-white shadow-md" type="button">
                <Search className="h-5 w-5" />
                Search Orders
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {orders.length ? orders.map((order) => <OrderCard key={order.id} order={order} />) : (
                <div className="rounded bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                  <p className="text-lg font-semibold text-slate-950">No orders found</p>
                  <p className="mt-2 text-slate-500">Try changing your search or filters.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const productCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const isDelivered = order.status === 'delivered' || order.status === 'placed' || order.status === 'confirmed';
  const statusLabel = getStatusLabel(order);

  return (
    <Link className="grid min-h-[150px] rounded bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md xl:grid-cols-[160px_1fr_220px_520px]" href={`/orders/${order.id}`}>
      <div className="relative h-24 w-24 justify-self-center overflow-hidden bg-slate-50">
        {firstItem ? <Image src={firstItem.product.images[0]} alt={firstItem.product.title} fill sizes="96px" className="object-contain" /> : null}
      </div>
      <div>
        <h2 className="text-lg font-medium text-slate-950">{firstItem?.product.title || `Order #${order.id.slice(-8)}`}</h2>
        <p className="mt-3 text-base text-slate-500">{productCount} Order {getStatusLabel(order)}</p>
        {!isDelivered ? (
          <p className="mt-5 inline-flex rounded border border-blue-600 px-4 py-2 text-sm text-slate-800">Payment not successful. Please contact your bank for any money deducted.</p>
        ) : null}
      </div>
      <p className="text-lg font-semibold text-slate-950">{currency(order.totalAmount)}</p>
      <div>
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${isDelivered ? 'bg-emerald-600' : 'bg-red-500'}`} />
          <p className="text-lg font-bold text-slate-950">{statusLabel}</p>
        </div>
        <p className="mt-4 text-base text-slate-950">{isDelivered ? 'Your item has been delivered' : 'Your Payment was not confirmed by the bank.'}</p>
        {isDelivered ? (
          <p className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-blue-600">
            <Star className="h-5 w-5 fill-blue-600" />
            Rate & Review Product
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function FilterGroup({ title, values, selected, onChange }: { title: string; values: string[]; selected: string[]; onChange: (values: string[]) => void }) {
  return (
    <section className="border-b px-5 py-5 last:border-b-0">
      <h2 className="font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-4">
        {values.map((value) => (
          <label className="flex cursor-pointer items-center gap-3 text-lg text-slate-950" key={value}>
            <input
              checked={selected.includes(value)}
              className="h-4 w-4"
              onChange={(event) => {
                onChange(event.target.checked ? [...selected, value] : selected.filter((item) => item !== value));
              }}
              type="checkbox"
            />
            {value}
          </label>
        ))}
      </div>
    </section>
  );
}

function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Link href="/">Home</Link>
      <span>›</span>
      <Link href="/profile">My Account</Link>
      <span>›</span>
      <span>My Orders</span>
    </div>
  );
}

function getStatusLabel(order: Order) {
  if (order.status === 'cancelled') return 'Order Not Placed';
  if (order.status === 'delivered') return `Delivered on ${formatShortDate(order.deliveredAt || order.createdAt)}`;
  if (order.status === 'placed' || order.status === 'confirmed' || order.status === 'shipped') return `Delivered on ${formatShortDate(order.deliveredAt || order.createdAt)}`;
  return order.status;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function matchesTimeFilter(order: Order, filters: string[]) {
  const created = new Date(order.createdAt);
  const now = new Date();
  return filters.some((filter) => {
    if (filter === 'Last 30 days') return now.getTime() - created.getTime() <= 30 * 24 * 60 * 60 * 1000;
    if (filter === 'Older') return created.getFullYear() < 2023;
    return created.getFullYear().toString() === filter;
  });
}

function Prompt() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">Login to view orders</h1>
        <Link href="/login" className="mt-5 inline-flex h-11 items-center rounded bg-blue-600 px-6 font-semibold text-white">Login</Link>
      </div>
    </div>
  );
}
