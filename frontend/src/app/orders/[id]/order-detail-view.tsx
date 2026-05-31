'use client';

import { ChevronDown, ChevronRight, Copy, Download, Headphones, Home, MapPin, MessageCircle, Star, Trophy, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/features/cart/cart.api';
import { currency } from '@/lib/api';
import { Order } from '@/types/order';

export function OrderDetailView() {
  const params = useParams<{ id: string }>();
  const orderId = String(params.id || '');
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
    retry: false
  });

  if (isLoading) return <DetailSkeleton />;
  if (error || !data?.order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link href="/orders" className="mt-5 inline-flex h-11 items-center rounded bg-blue-600 px-6 font-semibold text-white">Back to orders</Link>
        </div>
      </div>
    );
  }

  return <OrderDetail order={data.order} />;
}

function OrderDetail({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const address = order.shippingAddress;
  const listingAmount = order.listingAmount || order.items.reduce((sum, item) => sum + (item.listingPrice || item.price) * item.quantity, 0);
  const sellingPrice = order.totalAmount;
  const fee = 16;
  const otherDiscount = Math.max(0, (order.discountAmount || listingAmount - sellingPrice) + fee);
  const deliveredAt = order.deliveredAt || order.createdAt;
  const orderNumber = `OD${order.id.replace(/\D/g, '').slice(-18).padStart(18, '0')}`;

  return (
    <div className="bg-slate-100 px-4 py-4">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb orderNumber={orderNumber} />
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_360px]">
          <main className="space-y-2">
            <section className="bg-white">
              <div className="grid gap-5 p-5 sm:grid-cols-[1fr_90px]">
                <div>
                  <h1 className="max-w-2xl text-lg font-medium text-slate-950">{firstItem?.product.title || `Order #${order.id.slice(-8)}`}</h1>
                  <p className="mt-2 text-xs text-slate-500">{firstItem?.product.category || 'Product'}</p>
                  <p className="mt-2 text-xs text-slate-500">Seller: ViraEjnt</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {currency(firstItem?.price || order.totalAmount)} <span className="ml-2 text-xs font-semibold text-emerald-700">3 offers</span>
                  </p>
                </div>
                <div className="relative h-20 w-20 overflow-hidden bg-slate-100">
                  {firstItem ? <Image src={firstItem.product.images[0]} alt={firstItem.product.title} fill sizes="80px" className="object-contain" /> : null}
                </div>
              </div>
              <div className="border-t px-5 py-5">
                <Timeline createdAt={order.createdAt} deliveredAt={deliveredAt} />
                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600" type="button">
                  See All Updates
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="border-t px-5 py-4 text-center">
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950" type="button">
                  <MessageCircle className="h-5 w-5" />
                  Chat with us
                </button>
              </div>
            </section>

            <section className="bg-white p-5">
              <h2 className="font-semibold text-slate-950">Rate your experience</h2>
              <div className="mt-3 rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-950">Rate the product</p>
                <div className="mt-3 rounded bg-white p-3 text-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className="mx-1 inline h-5 w-5 text-slate-500" key={index} />
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-950">Recent issues</h2>
                <button className="text-sm font-semibold text-blue-600" type="button">View All ›</button>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-sm text-slate-950">I have an issue with the delivery of my order</p>
                  <p className="mt-2 text-xs"><span className="font-semibold text-emerald-700">Resolved</span> <span className="text-slate-500">| {formatShortDate(order.createdAt)}</span></p>
                </div>
                <ChevronRight className="h-5 w-5" />
              </div>
            </section>

            <section className="bg-white px-5 py-3 text-xs text-slate-500">
              Order #{orderNumber}
              <Copy className="ml-2 inline h-3 w-3 text-blue-600" />
            </section>
          </main>

          <aside className="space-y-4">
            <section className="bg-white p-5">
              <h2 className="font-bold text-slate-950">Delivery details</h2>
              <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                <InfoLine icon={<Home className="h-4 w-4" />} label={address?.label || 'Home'} value={address ? [address.line1, address.city, address.state].filter(Boolean).join(', ') : 'No address available'} />
                <div className="mt-3 border-t pt-3">
                  <InfoLine icon={<UserRound className="h-4 w-4" />} label={address?.fullName || order.customer?.name || 'Customer'} value={address?.phone || order.customer?.phone || 'Phone not added'} />
                </div>
              </div>
            </section>

            <section className="bg-white p-5">
              <h2 className="font-bold text-slate-950">Price details</h2>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <PriceRow label="Listing price" value={currency(listingAmount)} />
                <PriceRow label="Selling price" value={currency(sellingPrice)} />
                <PriceRow label="Total fees" value={currency(fee)} />
                <PriceRow label="Other discount" value={`-${currency(otherDiscount)}`} positive />
                <div className="my-4 border-t border-dashed border-slate-300" />
                <PriceRow label="Total amount" value={currency(order.totalAmount)} strong />
                <div className="mt-4 flex items-center justify-between rounded bg-white px-3 py-3 text-sm">
                  <span>Paid By</span>
                  <span className="inline-flex items-center gap-2"><Download className="h-4 w-4" /> {order.paymentMethod || 'Cash On Delivery'}</span>
                </div>
                <button className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-white font-semibold text-slate-950" type="button">
                  <Download className="h-4 w-4" />
                  Download Invoice
                </button>
              </div>
            </section>

            <button className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-200" type="button">
              <span className="inline-flex items-center gap-2"><Trophy className="h-4 w-4" /> Offers earned</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Link href="/">Home</Link>
      <span>›</span>
      <Link href="/profile">My Account</Link>
      <span>›</span>
      <Link href="/orders">My Orders</Link>
      <span>›</span>
      <span>{orderNumber}</span>
    </div>
  );
}

function Timeline({ createdAt, deliveredAt }: { createdAt: string; deliveredAt: string }) {
  return (
    <div className="ml-2 space-y-7">
      <TimelineItem label={`Order Confirmed, ${formatShortDate(createdAt)}`} />
      <TimelineItem label={`Delivered, ${formatShortDate(deliveredAt)}`} />
    </div>
  );
}

function TimelineItem({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-5 text-sm text-slate-950 before:absolute before:left-[7px] before:top-5 before:h-8 before:border-l before:border-dashed before:border-emerald-600 last:before:hidden">
      <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-[10px] text-white">✓</span>
      {label}
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-950">
      {icon}
      <span className="font-semibold">{label}</span>
      <span className="truncate text-slate-700">{value}</span>
    </div>
  );
}

function PriceRow({ label, value, positive = false, strong = false }: { label: string; value: string; positive?: boolean; strong?: boolean }) {
  return (
    <div className={`mt-3 flex justify-between gap-4 text-sm ${strong ? 'font-bold text-slate-950' : 'text-slate-950'}`}>
      <span>{label}</span>
      <span className={positive ? 'text-emerald-700' : ''}>{value}</span>
    </div>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function DetailSkeleton() {
  return (
    <div className="bg-slate-100 px-4 py-4">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <div className="h-[620px] animate-pulse bg-white" />
        <div className="space-y-4">
          <div className="h-32 animate-pulse bg-white" />
          <div className="h-72 animate-pulse bg-white" />
        </div>
      </div>
    </div>
  );
}
