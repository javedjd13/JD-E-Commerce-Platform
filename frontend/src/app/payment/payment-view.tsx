'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgePercent, Banknote, Building2, CalendarDays, CreditCard, Gift, HelpCircle, History, Lock, Smartphone, Zap } from 'lucide-react';
import { CheckoutPageSkeleton } from '@/components/common/loading-skeletons';
import { createOrder, getCart } from '@/features/cart/cart.api';
import { ApiError, currency } from '@/lib/api';
import { resetCart } from '@/store/cartStore';
import { useAppDispatch } from '@/store/hooks';

const protectPromiseFee = 125;

type PaymentMethod = {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const paymentMethods: PaymentMethod[] = [
  { id: 'saved', label: 'Saved Payment Options', icon: <History className="h-6 w-6" /> },
  { id: 'card', label: 'Credit / Debit / ATM Card', description: 'Save upto ₹2,500 • 12 offers available', icon: <CreditCard className="h-6 w-6" /> },
  { id: 'emi', label: 'EMI', description: 'Credit Card EMI', icon: <CalendarDays className="h-6 w-6" /> },
  { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="h-6 w-6" /> },
  { id: 'cod', label: 'Cash on Delivery', icon: <Banknote className="h-6 w-6" /> },
  { id: 'gift', label: 'Have a Flipkart Gift Card?', icon: <Gift className="h-6 w-6" /> },
  { id: 'upi', label: 'UPI', description: 'Unavailable', icon: <Smartphone className="h-6 w-6" />, disabled: true }
];

export function PaymentView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartQuery = useQuery({ queryKey: ['cart'], queryFn: getCart, retry: false });
  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      dispatch(resetCart());
      router.push(`/orders?placed=${data.order.id}`);
    }
  });

  if (cartQuery.isLoading) return <CheckoutPageSkeleton />;
  if (cartQuery.isError) {
    const error = cartQuery.error;
    const isAuthError = error instanceof ApiError && error.status === 401;
    return <Prompt title={isAuthError ? 'Login to complete payment' : error instanceof Error ? error.message : 'Payment load nahi ho paaya'} showLogin={isAuthError} />;
  }

  const cart = cartQuery.data!.cart;
  const items = cart.items;
  const subtotal = cart.subtotal;
  const mrpTotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const mrpDiscount = Math.max(0, mrpTotal - subtotal);
  const bundleDiscount = items.length ? 100 : 0;
  const total = subtotal + protectPromiseFee - bundleDiscount;

  if (!items.length) {
    return (
      <Prompt title="Your cart is empty" showLogin={false}>
        <Link href="/products" className="mt-5 inline-flex h-11 items-center rounded bg-amber-400 px-6 font-semibold text-slate-950">
          Browse products
        </Link>
      </Prompt>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b px-6 py-7">
          <div className="flex items-center gap-5">
            <button type="button" aria-label="Back to order summary" onClick={() => router.push('/checkout')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">Complete Payment</h1>
          </div>
          <div className="inline-flex items-center gap-1 rounded bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
            <Lock className="h-4 w-4" />
            100% Secure
          </div>
        </div>

        <div className="grid min-h-[650px] lg:grid-cols-[1fr_1fr_480px]">
          <PaymentMenu />

          <section className="border-x bg-slate-50 p-6">
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-bold text-slate-800">Note:</span> Please ensure your card can be used for online transactions.{' '}
              <span className="font-bold text-blue-700">Learn More</span>
            </p>

            <div className="mt-6 max-w-md rounded-lg bg-white p-5 shadow-sm">
              <label className="text-sm font-medium text-slate-950" htmlFor="cardNumber">
                Card Number
              </label>
              <div className="relative mt-2">
                <input
                  id="cardNumber"
                  inputMode="numeric"
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="h-12 w-full rounded border border-blue-600 px-3 pr-12 text-lg outline-none ring-blue-200 focus:ring-2"
                />
                <CreditCard className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-blue-200" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="validThru">
                    Valid Thru
                  </label>
                  <input id="validThru" inputMode="numeric" placeholder="MM / YY" className="mt-2 h-12 w-full rounded border px-3 text-lg outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="cvv">
                    CVV
                  </label>
                  <div className="relative mt-2">
                    <input id="cvv" inputMode="numeric" placeholder="CVV" className="h-12 w-full rounded border px-3 pr-10 text-lg outline-none focus:border-blue-600" />
                    <HelpCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={orderMutation.isPending}
                onClick={() => orderMutation.mutate()}
                className="mt-7 flex h-12 w-full items-center justify-center rounded bg-amber-400 text-lg font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
              >
                {orderMutation.isPending ? 'Processing...' : `Pay ${currency(total)}`}
              </button>
              {orderMutation.isError ? <p className="mt-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{orderMutation.error instanceof Error ? orderMutation.error.message : 'Payment fail ho gaya'}</p> : null}
            </div>
          </section>

          <aside className="space-y-5 bg-white p-6">
            <PaymentPriceCard mrpTotal={mrpTotal} protectPromiseFee={protectPromiseFee} mrpDiscount={mrpDiscount} bundleDiscount={bundleDiscount} total={total} />
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-emerald-700">10% instant discount</p>
                  <p className="mt-1 text-sm text-emerald-700">Claim now with payment offers</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-emerald-700"><BadgePercent className="h-5 w-5" /></span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-orange-600"><Zap className="h-5 w-5" /></span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold">+3</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function PaymentMenu() {
  return (
    <nav className="bg-white">
      {paymentMethods.map((method) => (
        <button
          type="button"
          disabled={method.disabled}
          className={`grid w-full grid-cols-[44px_1fr_auto] gap-3 border-b px-6 py-6 text-left transition ${
            method.id === 'card' ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
          } ${method.disabled ? 'cursor-not-allowed text-slate-400' : 'text-slate-950'}`}
          key={method.id}
        >
          <span className="text-slate-800">{method.icon}</span>
          <span>
            <span className="block text-lg font-bold">{method.label}</span>
            {method.description ? <span className={method.disabled ? 'mt-2 block text-sm font-semibold text-slate-500' : 'mt-2 block text-sm text-emerald-700'}>{method.description}</span> : null}
          </span>
          {method.disabled ? <HelpCircle className="mt-1 h-4 w-4" /> : null}
        </button>
      ))}
    </nav>
  );
}

function PaymentPriceCard({
  mrpTotal,
  protectPromiseFee,
  mrpDiscount,
  bundleDiscount,
  total
}: {
  mrpTotal: number;
  protectPromiseFee: number;
  mrpDiscount: number;
  bundleDiscount: number;
  total: number;
}) {
  return (
    <div className="rounded-lg bg-blue-50 p-4">
      <PriceRow label="MRP (incl. of all taxes)" value={currency(mrpTotal)} />
      <div className="mt-5">
        <p className="text-lg font-medium">Fees ^</p>
        <PriceRow label="Protect Promise Fee" value={currency(protectPromiseFee)} muted />
      </div>
      <div className="mt-5 border-t border-blue-100 pt-5">
        <p className="text-lg font-medium">Discounts ^</p>
        <PriceRow label="MRP Discount" value={`-${currency(mrpDiscount)}`} positive muted />
        <PriceRow label="Buy more & save more" value={`-${currency(bundleDiscount)}`} positive muted />
      </div>
      <div className="mt-5 border-t border-blue-100 pt-5">
        <PriceRow label="Total Amount" value={currency(total)} strong />
      </div>
    </div>
  );
}

function PriceRow({ label, value, positive = false, strong = false, muted = false }: { label: string; value: string; positive?: boolean; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`mt-4 flex justify-between gap-4 ${strong ? 'text-xl font-bold text-blue-700' : muted ? 'text-lg text-slate-600' : 'text-lg text-slate-950'}`}>
      <span>{label}</span>
      <span className={positive ? 'text-emerald-700' : ''}>{value}</span>
    </div>
  );
}

function Prompt({ title, showLogin = true, children }: { title: string; showLogin?: boolean; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
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
