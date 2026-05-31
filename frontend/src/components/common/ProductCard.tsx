import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Product } from '@/types/product';
import { currency, dealPrice } from '@/lib/api';

export function ProductCard({ product }: { product: Product }) {
  const salePrice = dealPrice(product.price, product.discount);
  const bankOffer = Math.max(499, Math.round(salePrice * 0.08));

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <article className="h-full overflow-hidden bg-white p-4 transition hover:shadow-md">
        <div className="relative aspect-[0.88] overflow-hidden rounded-xl bg-slate-50">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1280px) 33vw, 260px"
            className="object-contain p-3 transition duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-slate-950 shadow-sm">
            {product.rating.toFixed(1)}
            <Star className="h-4 w-4 fill-emerald-600 text-emerald-600" />
            <span className="font-normal text-slate-700">({Math.max(99, Math.round(product.rating * 1543)).toLocaleString('en-IN')})</span>
          </div>
        </div>

        <div className="pt-3">
          <h3 className="line-clamp-1 text-base font-medium text-slate-700">{product.title}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <span className="text-base text-slate-500 line-through">{currency(product.price)}</span>
            <span className="text-base font-extrabold text-slate-950">{currency(salePrice)}</span>
          </div>
          <p className="mt-2 line-clamp-1 text-sm font-semibold text-blue-700">
            {currency(bankOffer)} with Bank offer {product.discount >= 35 ? '+ more' : ''}
          </p>
        </div>
      </article>
    </Link>
  );
}
