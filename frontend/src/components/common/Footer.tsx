import { CreditCard, Headphones, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandLogo } from './BrandLogo';

const shopLinks = ['Mobiles', 'Electronics', 'Fashion', 'Grocery', 'Beauty'];
const supportLinks = ['Help Center', 'Track Orders', 'Returns', 'Shipping', 'Payments'];

export function Footer() {
  return (
    <footer className="mt-8 border-t bg-card text-card-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.35fr_1fr_1fr_1.15fr]">
        <section>
          <BrandLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Smart shopping for daily essentials, devices, fashion, and home upgrades with secure checkout and fast delivery.
          </p>
          <div className="mt-5 grid max-w-md gap-3 sm:grid-cols-3">
            <TrustPill icon={<Truck className="h-4 w-4" />} label="Fast delivery" />
            <TrustPill icon={<ShieldCheck className="h-4 w-4" />} label="Secure pay" />
            <TrustPill icon={<CreditCard className="h-4 w-4" />} label="Easy EMI" />
          </div>
        </section>

        <FooterColumn title="Shop" links={shopLinks} />
        <FooterColumn title="Support" links={supportLinks} />

        <section className="rounded-2xl bg-muted p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-card text-primary ring-1 ring-border">
              <Headphones className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold">Need help?</h2>
              <p className="text-sm text-muted-foreground">We are here every day.</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-card p-4 text-sm ring-1 ring-border">
            <p className="font-semibold">Get offers in your inbox</p>
            <div className="mt-3 flex gap-2">
              <input className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Email address" />
              <button className="rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground" type="button">
                Join
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        (c) 2026 NexaMart. Built for fast, secure, everyday shopping.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="mt-4 space-y-3">
        {links.map((link) => (
          <Link className="block text-sm font-semibold transition hover:text-primary" href="/products" key={link}>
            {link}
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrustPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-muted-foreground ring-1 ring-border">
      {icon}
      {label}
    </div>
  );
}
