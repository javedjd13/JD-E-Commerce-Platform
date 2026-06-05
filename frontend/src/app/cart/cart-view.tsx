'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Info, Minus, PackageCheck, Plus, ShieldCheck, Trash2, Wrench, X, Zap } from 'lucide-react';
import { CartPageSkeleton } from '@/components/common/loading-skeletons';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { useCart } from '@/features/cart/use-cart';
import { ApiError, currency } from '@/lib/api';
import { CartItem } from '@/types/cart';

const deliveryFee = 125;

export function CartView() {
  const { cart, isLoading, isError, error, updateItem, removeItem } = useCart();

  if (isLoading) return <CartPageSkeleton />;
  if (isError) {
    const isAuthError = error instanceof ApiError && error.status === 401;
    return <AuthPrompt title={isAuthError ? 'Please login to view your cart' : error instanceof Error ? error.message : 'Cart load nahi ho paaya'} showLogin={isAuthError} />;
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const mrpTotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const discounts = Math.max(0, mrpTotal - subtotal);
  const fees = items.length ? deliveryFee : 0;
  const total = subtotal + fees;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_374px]">
      <section className="min-w-0 space-y-3">
        <div className="overflow-hidden rounded-sm bg-card text-card-foreground shadow-sm ring-1 ring-border">
          <div className="grid grid-cols-2 border-b text-center text-sm">
            <div className="border-b-[3px] border-blue-600 py-4 font-semibold text-blue-700">NexaMart ({count})</div>
            <div className="py-4 text-card-foreground">Grocery</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-4 text-sm">
            <div className="min-w-0">
              <span className="font-semibold">Deliver to: </span>
              <span>Javed Ansari, 440018</span>
              <span className="ml-2 rounded bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">HOME</span>
              <p className="mt-1 truncate text-muted-foreground">1206b Islam Sathe House, Dobhi Nagar, Mominpura, Near Murtuza Garage, Nagpur</p>
            </div>
            <button className="h-9 rounded border border-border px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40" type="button">
              Change
            </button>
          </div>

          {items.length ? (
            items.map((item) => (
              <CartLine
                item={item}
                isBusy={updateItem.isPending || removeItem.isPending}
                onQuantity={(quantity) => updateItem.mutate({ productId: item.productId, quantity })}
                onRemove={() => removeItem.mutate(item.productId)}
                key={item.id}
              />
            ))
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="text-lg font-bold">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Products add karo, phir checkout yahin se hoga.</p>
              <Link href="/products" className="mt-5 inline-flex h-11 items-center rounded bg-orange-500 px-6 font-bold text-white">
                Browse products
              </Link>
            </div>
          )}
        </div>

        {items.length ? (
          <div className="rounded-sm bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border">
            <h2 className="font-bold">Buy More & Save More</h2>
            <p className="mt-1 text-sm font-semibold text-emerald-700">Saved {currency(Math.max(100, Math.round(discounts * 0.04)))} with {items.length} offers</p>
          </div>
        ) : null}
      </section>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="rounded-sm bg-card text-card-foreground shadow-sm ring-1 ring-border">
          <div className="border-b px-4 py-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Price Details</div>
          <div className="space-y-4 px-4 py-4 text-sm">
            <PriceRow label="MRP" value={currency(mrpTotal)} />
            <PriceRow label="Fees" value={currency(fees)} />
            <PriceRow label="Discounts" value={`-${currency(discounts)}`} positive />
            <PriceRow label="Total Amount" value={currency(total)} strong />
            {items.length ? (
              <div className="rounded-md bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/60">
                You will save {currency(discounts)} on this order
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 text-sm font-semibold text-muted-foreground">
          <ShieldCheck className="h-7 w-7 text-muted-foreground" />
          <p>Safe and secure payments. Easy returns. 100% Authentic products.</p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-sm bg-card p-3 text-card-foreground shadow-sm ring-1 ring-border">
          <div>
            <p className="text-sm text-muted-foreground line-through">{currency(mrpTotal)}</p>
            <p className="text-xl font-semibold">{currency(total)}</p>
          </div>
          <Link
            href="/checkout"
            aria-disabled={!items.length}
            className={`flex h-10 min-w-40 items-center justify-center rounded-sm px-6 text-sm font-semibold ${items.length ? 'bg-amber-400 text-slate-950 hover:bg-amber-500' : 'pointer-events-none bg-muted text-muted-foreground'
              }`}
          >
            Place order
          </Link>
        </div>
      </aside>
    </div>
  );
}

function CartLine({
  item,
  isBusy,
  onQuantity,
  onRemove
}: {
  item: CartItem;
  isBusy: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const original = Number(item.product.price);
  const discountPercent = original > 0 ? Math.max(0, Math.round(((original - item.unitPrice) / original) * 100)) : 0;
  const bankOffer = Math.max(499, Math.round(item.lineTotal * 0.08));
  const image = item.product.images?.[0];

  return (
    <article className="border-b last:border-b-0">
      <div className="grid gap-4 px-4 py-5 sm:grid-cols-[76px_1fr]">
        <div className="space-y-3">
          <Link href={`/products/${item.productId}`} className="relative block h-20 overflow-hidden rounded-sm border border-border bg-muted">
            {image ? (
              <Image src={image} alt={item.product.title} fill sizes="80px" className="object-cover" />
            ) : (
              <ProductImagePlaceholder title={item.product.title} />
            )}
          </Link>
          <div className="flex items-center rounded-sm border text-sm">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={isBusy || item.quantity <= 1}
              onClick={() => onQuantity(item.quantity - 1)}
              className="grid h-8 w-8 place-items-center disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="grid h-8 min-w-10 place-items-center border-x px-2">Qty: {item.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={isBusy}
              onClick={() => onQuantity(item.quantity + 1)}
              className="grid h-8 w-8 place-items-center disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <Link href={`/products/${item.productId}`} className="line-clamp-1 text-base font-medium text-card-foreground transition hover:text-blue-700 dark:hover:text-blue-300">
            {item.product.title}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{item.product.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-sm">
            <span className="text-emerald-700">★★★★★</span>
            <span className="font-semibold text-emerald-700">{item.product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({Math.round(item.product.rating * 9436).toLocaleString('en-IN')})</span>
            <span className="rounded px-1.5 py-0.5 text-xs font-bold text-blue-700">Assured</span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="font-bold text-emerald-700">↓ {discountPercent}%</span>
            <span className="text-lg text-muted-foreground line-through">{currency(original)}</span>
            <span className="text-xl font-bold text-card-foreground">{currency(item.unitPrice)}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-blue-700">
            WOW! {currency(bankOffer)} with Bank offer
          </p>
          <p className="mt-2 text-sm text-muted-foreground">+ {currency(deliveryFee)} Protect Promise Fee <Info className="inline h-3.5 w-3.5" /></p>
          <p className="mt-5 text-sm">Delivery by May 29, Fri</p>
        </div>
      </div>

      <div className="mx-4 rounded-lg bg-muted">
        <ServiceRow icon={<ShieldCheck className="h-5 w-5" />} title="Complete Protection Plan" detail={`${currency(2399)} ${currency(1349)} 43% off • 36 Months`} close />
        <ServiceRow icon={<Wrench className="h-5 w-5" />} title={`${item.product.title.split(' ')[0]} Installation and Demo`} detail="FREE • Installation & Demo in 6-7 days" />
        <ServiceRow icon={<ShieldCheck className="h-5 w-5" />} title="NexaMart Trust Shield" detail={`${currency(999)} 100% off • 30 days Damage Coverage.`} close />
      </div>

      <div className="mt-3 grid grid-cols-3 border-t text-sm font-bold text-muted-foreground">
        <button type="button" className="flex h-12 items-center justify-center gap-2 border-r transition hover:bg-muted hover:text-foreground">
          <PackageCheck className="h-4 w-4" />
          Save for later
        </button>
        <button type="button" disabled={isBusy} onClick={onRemove} className="flex h-12 items-center justify-center gap-2 border-r transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950/40 dark:hover:text-red-300">
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
        <Link href="/checkout" className="flex h-12 items-center justify-center gap-2 transition hover:bg-muted hover:text-foreground">
          <Zap className="h-4 w-4" />
          Buy this now
        </Link>
      </div>
    </article>
  );
}

function ServiceRow({ icon, title, detail, close = false }: { icon: ReactNode; title: string; detail: string; close?: boolean }) {
  return (
    <div className="grid grid-cols-[28px_1fr_auto] gap-3 border-b px-3 py-3 last:border-b-0">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-medium">{title}</p>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{detail}</p>
      </div>
      {close ? (
        <button type="button" aria-label="Dismiss service" className="text-muted-foreground transition hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      ) : null}
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

function AuthPrompt({ title, showLogin = true }: { title: string; showLogin?: boolean }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-3xl bg-card p-8 text-card-foreground shadow-sm ring-1 ring-border">
        <h1 className="text-2xl font-bold">{title}</h1>
        {showLogin ? (
          <Link href="/login" className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-6 font-semibold text-white">
            Login
          </Link>
        ) : null}
      </div>
    </div>
  );
}
