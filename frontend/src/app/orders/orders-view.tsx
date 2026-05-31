'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { OrdersPageSkeleton } from '@/components/common/loading-skeletons';
import { getOrders } from '@/features/cart/cart.api';
import { currency } from '@/lib/api';

export function OrdersView() {
  const { data, isLoading, error } = useQuery({ queryKey: ['orders'], queryFn: getOrders, retry: false });

  if (isLoading) return <OrdersPageSkeleton />;
  if (error) return <Prompt />;

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      {data!.orders.map((order) => (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200" key={order.id}>
          <div className="flex flex-wrap justify-between gap-3 border-b pb-3">
            <div>
              <p className="font-bold">Order #{order.id.slice(-8)}</p>
              <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{currency(order.totalAmount)}</p>
              <p className="text-sm capitalize text-emerald-700">{order.status}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div className="flex items-center gap-3" key={item.id}>
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                  <Image src={item.product.images[0]} alt={item.product.title} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.product.title}</p>
                  <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Prompt() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">Login to view orders</h1>
        <Link href="/login" className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 font-semibold text-white">Login</Link>
      </div>
    </div>
  );
}
