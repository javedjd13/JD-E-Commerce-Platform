import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex h-control-lg items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 px-3 font-black text-slate-950 shadow-sm ring-1 ring-amber-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-amber-300 shadow-inner">
        <Sparkles className="h-4 w-4 fill-current" />
      </span>
      {compact ? null : (
        <span className="tracking-tight">
          Nexa<span className="text-blue-700">Mart</span>
        </span>
      )}
    </Link>
  );
}
