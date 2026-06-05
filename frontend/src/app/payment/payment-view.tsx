'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgePercent, Banknote, Building2, CalendarDays, CreditCard, Gift, HelpCircle, History, Lock, Smartphone, Zap } from 'lucide-react';
import { useState } from 'react';
import { CheckoutPageSkeleton } from '@/components/common/loading-skeletons';
import { createOrder, createRazorpayOrder, getCart, verifyRazorpayPayment } from '@/features/cart/cart.api';
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

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Razorpay checkout load nahi ho paaya')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay checkout load nahi ho paaya'));
    document.body.appendChild(script);
  });
}

export function PaymentView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [paymentError, setPaymentError] = useState('');
  const [isPayingOnline, setIsPayingOnline] = useState(false);
  const cartQuery = useQuery({ queryKey: ['cart'], queryFn: getCart, retry: false });
  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      dispatch(resetCart());
      router.push(`/orders?placed=${data.order.id}`);
    }
  });

  async function startRazorpayPayment() {
    setPaymentError('');
    setIsPayingOnline(true);

    try {
      await loadRazorpayScript();
      const razorpayOrder = await createRazorpayOrder();

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout available nahi hai');
      }

      const checkout = new window.Razorpay({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'NexaMart',
        description: 'Product order payment',
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: razorpayOrder.customer.name,
          email: razorpayOrder.customer.email,
          contact: razorpayOrder.customer.contact
        },
        theme: {
          color: '#facc15'
        },
        handler: async (response) => {
          try {
            const data = await verifyRazorpayPayment(response);
            dispatch(resetCart());
            router.push(`/orders?placed=${data.order.id}`);
          } catch (err) {
            setPaymentError(err instanceof Error ? err.message : 'Payment verify nahi ho paaya');
          } finally {
            setIsPayingOnline(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment Canceled by user');
            setIsPayingOnline(false);
          }
        }
      });

      checkout.open();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment start nahi ho paaya');
      setIsPayingOnline(false);
    }
  }

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
      <section className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm ring-1 ring-border">
        <div className="flex items-center justify-between border-b px-6 py-7">
          <div className="flex items-center gap-5">
            <button type="button" aria-label="Back to order summary" onClick={() => router.push('/checkout')} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">Complete Payment</h1>
          </div>
          <div className="inline-flex items-center gap-1 rounded bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
            <Lock className="h-4 w-4" />
            100% Secure
          </div>
        </div>

        <div className="grid min-h-[650px] lg:grid-cols-[1fr_1fr_480px]">
          <PaymentMenu selectedMethod={selectedMethod} onSelect={setSelectedMethod} />

          <section className="border-x bg-muted p-6">
            {selectedMethod === 'cod' ? (
              <div className="max-w-md rounded-lg bg-card p-5 text-card-foreground shadow-sm ring-1 ring-border">
                <div className="flex items-start gap-3">
                  <Banknote className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <h2 className="font-bold text-card-foreground">Cash on Delivery</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Order place hote hi cart clear ho jayega. Payment delivery ke time collect hoga.</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={orderMutation.isPending}
                  onClick={() => orderMutation.mutate()}
                  className="mt-7 flex h-12 w-full items-center justify-center rounded bg-amber-400 text-lg font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
                >
                  {orderMutation.isPending ? 'Placing order...' : 'Place COD Order'}
                </button>
                {orderMutation.isError ? (
                  <p className="mt-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/60">
                    {orderMutation.error instanceof Error ? orderMutation.error.message : 'Order place nahi ho paaya'}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-bold text-card-foreground">Note:</span> Razorpay Checkout par card, UPI, net banking aur wallet options securely complete honge.{' '}
                  <span className="font-bold text-blue-700">Learn More</span>
                </p>

                <div className="mt-6 max-w-md rounded-lg bg-card p-5 text-card-foreground shadow-sm ring-1 ring-border">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <h2 className="font-bold text-card-foreground">Pay securely with Razorpay</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Final payable amount backend cart total se Razorpay order mein lock hota hai.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPayingOnline}
                    onClick={startRazorpayPayment}
                    className="mt-7 flex h-12 w-full items-center justify-center rounded bg-amber-400 text-lg font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-60"
                  >
                    {isPayingOnline ? 'Opening Razorpay...' : 'Pay Online'}
                  </button>
                  {paymentError ? (
                    <p className="mt-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/60">
                      {paymentError}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </section>

          <aside className="space-y-5 bg-card p-6">
            <PaymentPriceCard mrpTotal={mrpTotal} protectPromiseFee={protectPromiseFee} mrpDiscount={mrpDiscount} bundleDiscount={bundleDiscount} total={total} />
            <div className="rounded-lg bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">10% instant discount</p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">Claim now with payment offers</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-card text-emerald-700 ring-1 ring-border dark:text-emerald-300"><BadgePercent className="h-5 w-5" /></span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-card text-orange-600 ring-1 ring-border dark:text-orange-300"><Zap className="h-5 w-5" /></span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-card text-sm font-bold text-card-foreground ring-1 ring-border">+3</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function PaymentMenu({ selectedMethod, onSelect }: { selectedMethod: string; onSelect: (method: string) => void }) {
  return (
    <nav className="bg-card text-card-foreground">
      {paymentMethods.map((method) => (
        <button
          type="button"
          disabled={method.disabled}
          onClick={() => onSelect(method.id)}
          className={`grid w-full grid-cols-[44px_1fr_auto] gap-3 border-b px-6 py-6 text-left transition ${method.id === selectedMethod ? 'bg-muted' : 'bg-card hover:bg-muted'
            } ${method.disabled ? 'cursor-not-allowed text-muted-foreground opacity-70' : 'text-card-foreground'}`}
          key={method.id}
        >
          <span className="text-muted-foreground">{method.icon}</span>
          <span>
            <span className="block text-lg font-bold">{method.label}</span>
            {method.description ? <span className={method.disabled ? 'mt-2 block text-sm font-semibold text-muted-foreground' : 'mt-2 block text-sm text-emerald-700 dark:text-emerald-300'}>{method.description}</span> : null}
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
    <div className="rounded-lg bg-blue-50 p-4 text-slate-950 ring-1 ring-blue-100 dark:bg-slate-950/60 dark:text-card-foreground dark:ring-border">
      <PriceRow label="MRP (incl. of all taxes)" value={currency(mrpTotal)} />
      <div className="mt-5">
        <p className="text-lg font-medium">Fees ^</p>
        <PriceRow label="Protect Promise Fee" value={currency(protectPromiseFee)} muted />
      </div>
      <div className="mt-5 border-t border-blue-100 pt-5 dark:border-border">
        <p className="text-lg font-medium">Discounts ^</p>
        <PriceRow label="MRP Discount" value={`-${currency(mrpDiscount)}`} positive muted />
        <PriceRow label="Buy more & save more" value={`-${currency(bundleDiscount)}`} positive muted />
      </div>
      <div className="mt-5 border-t border-blue-100 pt-5 dark:border-border">
        <PriceRow label="Total Amount" value={currency(total)} strong />
      </div>
    </div>
  );
}

function PriceRow({ label, value, positive = false, strong = false, muted = false }: { label: string; value: string; positive?: boolean; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`mt-4 flex justify-between gap-4 ${strong ? 'text-xl font-bold text-blue-700 dark:text-blue-300' : muted ? 'text-lg text-slate-600 dark:text-muted-foreground' : 'text-lg text-slate-950 dark:text-card-foreground'}`}>
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
