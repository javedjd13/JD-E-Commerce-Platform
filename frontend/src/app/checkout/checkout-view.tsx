'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronRight, Info, PackageCheck, ShieldCheck, X } from 'lucide-react';
import { CheckoutPageSkeleton } from '@/components/common/loading-skeletons';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { getCart } from '@/features/cart/cart.api';
import { ApiError, currency } from '@/lib/api';
import { authKeys, getMe } from '@/lib/auth';
import { CartItem } from '@/types/cart';

const deliveryFee = 125;

export function CheckoutView() {
  const router = useRouter();
  const cartQuery = useQuery({ queryKey: ['cart'], queryFn: getCart, retry: false });
  const userQuery = useQuery({ queryKey: authKeys.me, queryFn: getMe, retry: false });

  if (cartQuery.isLoading || userQuery.isLoading) return <CheckoutPageSkeleton />;
  if (cartQuery.isError) {
    const error = cartQuery.error;
    const isAuthError = error instanceof ApiError && error.status === 401;
    return <Prompt title={isAuthError ? 'Login to checkout' : error instanceof Error ? error.message : 'Checkout load nahi ho paaya'} showLogin={isAuthError} />;
  }

  const cart = cartQuery.data!.cart;
  const items = cart.items;
  const subtotal = cart.subtotal;
  const mrpTotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const discounts = Math.max(0, mrpTotal - subtotal);
  const fees = items.length ? deliveryFee : 0;
  const total = subtotal + fees;

  if (!items.length) {
    return (
      <Prompt title="Your cart is empty" showLogin={false}>
        <Link href="/products" className="mt-5 inline-flex h-11 items-center rounded bg-orange-500 px-6 font-semibold text-white">
          Browse products
        </Link>
      </Prompt>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[1fr_374px]">
      <section className="min-w-0 space-y-3">
        <div className="rounded-sm bg-card text-card-foreground shadow-sm ring-1 ring-border">
          <CheckoutSteps />
        </div>

        <div className="rounded-sm bg-card text-card-foreground shadow-sm ring-1 ring-border">
          <div className="flex items-start justify-between gap-4 border-b px-4 py-4">
            <div className="min-w-0 text-sm">
              <p className="mb-2 font-semibold">Deliver to:</p>
              <p className="font-semibold">
                {userQuery.data?.user?.name || 'NexaMart Customer'} <span className="rounded bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">HOME</span>
              </p>
              <p className="mt-2 leading-relaxed text-muted-foreground">1206b Islam Sathe House, Dobhi Nagar, Mominpura, Near Murtuza Garage, Nagpur 440018</p>
              <p className="mt-1 text-muted-foreground">{userQuery.data?.user?.email || 'customer@nexamart.local'}</p>
            </div>
            <button type="button" className="h-9 rounded border border-border px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40">
              Change
            </button>
          </div>

          <div className="divide-y">
            {items.map((item) => (
              <CheckoutItem item={item} key={item.id} />
            ))}
          </div>

          <div className="space-y-3 border-t bg-card px-4 py-4">
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 accent-blue-600" disabled />
              GST Invoice not available
            </label>
            <button type="button" className="flex w-full items-center justify-between rounded-sm bg-amber-50 px-3 py-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-100 transition hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900/60 dark:hover:bg-amber-950/50">
              <span>Some items are not eligible for GST invoice</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <section className="rounded-sm bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PackageCheck className="h-5 w-5 text-amber-500" />
            Rest assured with Open Box Delivery
          </div>
          <div className="mt-4 flex gap-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded border border-border bg-muted">
              {items[0].product.images?.[0] ? (
                <Image src={items[0].product.images[0]} alt={items[0].product.title} fill sizes="64px" className="object-cover" />
              ) : (
                <ProductImagePlaceholder title={items[0].product.title} />
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Delivery agent will open the package so you can check for correct product, damage or missing items. Share OTP to accept the delivery.
            </p>
          </div>
        </section>
      </section>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <PriceDetails mrpTotal={mrpTotal} fees={fees} discounts={discounts} total={total} />

        <div className="flex items-center gap-3 px-5 text-sm font-semibold text-muted-foreground">
          <ShieldCheck className="h-7 w-7 text-muted-foreground" />
          <p>Safe and secure payments. Easy returns. 100% Authentic products.</p>
        </div>

        <div className="rounded-sm bg-card p-3 text-card-foreground shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground line-through">{currency(mrpTotal)}</p>
              <p className="text-xl font-semibold">{currency(total)} <Info className="inline h-3.5 w-3.5 text-muted-foreground" /></p>
              <button type="button" className="mt-1 text-xs font-semibold text-blue-700 dark:text-blue-300">View price details</button>
            </div>
            <button
              type="button"
              onClick={() => router.push('/payment')}
              className="flex h-10 min-w-40 items-center justify-center rounded-sm bg-amber-400 px-6 text-sm font-semibold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
            >
              Continue
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CheckoutSteps() {
  const steps = [
    { label: 'Address', done: true },
    { label: 'Order Summary', active: true },
    { label: 'Payment' }
  ];

  return (
    <div className="mx-auto flex max-w-xl items-center justify-center px-6 py-3 text-xs">
      {steps.map((step, index) => (
        <div className="flex items-center" key={step.label}>
          <div className="flex flex-col items-center gap-1">
            <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${step.done || step.active ? 'border-blue-600 bg-blue-600 text-white' : 'border-border text-muted-foreground'}`}>
              {step.done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span className={step.active ? 'font-bold text-card-foreground' : 'text-muted-foreground'}>{step.label}</span>
          </div>
          {index < steps.length - 1 ? <span className="mx-3 h-px w-24 bg-border" /> : null}
        </div>
      ))}
    </div>
  );
}

function CheckoutItem({ item }: { item: CartItem }) {
  const original = Number(item.product.price);
  const discountPercent = original > 0 ? Math.max(0, Math.round(((original - item.unitPrice) / original) * 100)) : 0;
  const bankOffer = Math.max(499, Math.round(item.lineTotal * 0.08));
  const image = item.product.images?.[0];

  return (
    <article className="px-4 py-4">
      <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
        <div className="space-y-3">
          <Link href={`/products/${item.productId}`} className="relative block h-20 overflow-hidden rounded-sm border border-border bg-muted">
            {image ? (
              <Image src={image} alt={item.product.title} fill sizes="80px" className="object-cover" />
            ) : (
              <ProductImagePlaceholder title={item.product.title} />
            )}
          </Link>
          <div className="rounded-sm border px-2 py-1 text-center text-xs">Qty: {item.quantity}</div>
        </div>
        <div className="min-w-0">
          <Link href={`/products/${item.productId}`} className="line-clamp-1 text-sm font-medium text-card-foreground transition hover:text-blue-700 dark:hover:text-blue-300">
            {item.product.title}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{item.product.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
            <span className="text-emerald-700">★★★★★</span>
            <span className="font-semibold text-emerald-700">{item.product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({Math.round(item.product.rating * 9436).toLocaleString('en-IN')})</span>
            <span className="rounded px-1.5 py-0.5 font-bold text-blue-700">Assured</span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="font-bold text-emerald-700">↓ {discountPercent}%</span>
            <span className="text-muted-foreground line-through">{currency(original)}</span>
            <span className="text-lg font-bold text-card-foreground">{currency(item.unitPrice)}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-blue-700">WOW! {currency(bankOffer)} with Bank offer</p>
          <p className="mt-2 text-xs text-muted-foreground">+ {currency(deliveryFee)} Protect Promise Fee <Info className="inline h-3.5 w-3.5" /></p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted">
        <ServiceRow title="Flipkart Trust Shield" detail={`${currency(999)} 100% off • 30 days Damage Coverage.`} />
        <ServiceRow title="Complete Protection Plan" detail={`${currency(2399)} ${currency(1349)} 43% off • 36 Months`} />
        <ServiceRow title={`${item.product.title.split(' ')[0]} Installation and Demo`} detail="FREE • Installation & Demo in 6-7 days" />
      </div>

      <p className="mt-4 text-sm font-medium">Delivery by May 29, Fri</p>
    </article>
  );
}

function ServiceRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid grid-cols-[22px_1fr_auto] gap-3 border-b px-3 py-3 last:border-b-0">
      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-medium">{title}</p>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      <button type="button" aria-label="Dismiss service" className="text-muted-foreground transition hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function PriceDetails({ mrpTotal, fees, discounts, total }: { mrpTotal: number; fees: number; discounts: number; total: number }) {
  return (
    <div className="rounded-sm bg-card text-card-foreground shadow-sm ring-1 ring-border">
      <div className="space-y-4 px-4 py-4 text-sm">
        <PriceRow label="MRP" value={currency(mrpTotal)} />
        <PriceRow label="Fees" value={currency(fees)} />
        <PriceRow label="Discounts" value={`-${currency(discounts)}`} positive />
        <PriceRow label="Total Amount" value={currency(total)} strong />
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/60">
          You will save {currency(discounts)} on this order
        </div>
      </div>
    </div>
  );
}

function PriceRow({ label, value, positive = false, strong = false }: { label: string; value: string; positive?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-dashed border-border pb-3 last:border-b-0 ${strong ? 'font-bold text-card-foreground' : ''}`}>
      <span>{label}</span>
      <span className={positive ? 'text-emerald-700 dark:text-emerald-300' : ''}>{value}</span>
    </div>
  );
}

function Prompt({ title, showLogin = true, children }: { title: string; showLogin?: boolean; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-3xl bg-card p-8 text-card-foreground shadow-sm ring-1 ring-border">
        <h1 className="text-2xl font-bold">{title}</h1>
        {showLogin ? (
          <Link href="/login" className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 font-semibold text-white">
            Login
          </Link>
        ) : null}
        {children}
      </div>
    </div>
  );
}
