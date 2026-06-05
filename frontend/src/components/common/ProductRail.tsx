import { Product } from '@/types/product';
import { currency, dealPrice } from '@/lib/api';
import { ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

type ProductRailProps = {
  title: string;
  products: Product[];
  tone?: 'spotlight' | 'clean';
};

export function ProductRail({ title, products, tone = 'clean' }: ProductRailProps) {
  const isSpotlight = tone === 'spotlight';

  return (
    <section
      className={
        isSpotlight
          ? 'rounded-[1.35rem] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-3 shadow-sm'
          : 'space-y-4'
      }
    >
      <div className={isSpotlight ? 'mb-3 flex items-center justify-between px-2 pt-1' : 'flex items-center justify-between'}>
        <h2 className={isSpotlight ? 'text-2xl font-extrabold text-white md:text-3xl' : 'text-2xl font-extrabold text-foreground'}>{title}</h2>
        <Link
          href="/products"
          aria-label={`View all ${title}`}
          className={
            isSpotlight
              ? 'grid h-9 w-12 place-items-center rounded-full bg-slate-950 text-white shadow-sm ring-1 ring-white/10 transition hover:scale-105 hover:bg-slate-900'
              : 'grid h-12 w-12 place-items-center rounded-full bg-card text-card-foreground shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:bg-muted hover:shadow-md'
          }
        >
          <ArrowRight className="h-6 w-6" />
        </Link>
      </div>

      <div className={isSpotlight ? 'scrollbar-none flex gap-2 overflow-x-auto rounded-2xl bg-card p-2 md:gap-3' : 'scrollbar-none flex gap-4 overflow-x-auto'}>
        {products.map((product) => (
          <ProductTile product={product} spotlight={isSpotlight} key={product.id} />
        ))}
      </div>
    </section>
  );
}

function ProductTile({ product, spotlight }: { product: Product; spotlight: boolean }) {
  const image = product.images?.[0];
  const salePrice = dealPrice(product.price, product.discount);

  if (spotlight) {
    return (
      <Link href={`/products/${product.id}`} className="group min-w-[245px] flex-1 md:min-w-[260px]">
        <article className="overflow-hidden rounded-lg bg-card text-card-foreground transition group-hover:-translate-y-0.5">
          <div className="relative aspect-[1.48] overflow-hidden rounded-lg bg-muted">
            {image ? (
              <Image src={image} alt={product.title} fill sizes="(max-width: 768px) 70vw, 320px" className="object-contain p-3 transition duration-300 group-hover:scale-105" />
            ) : (
              <ProductImagePlaceholder title={product.title} />
            )}
          </div>
          <div className="pt-2">
            <h3 className="line-clamp-1 text-base font-medium text-card-foreground md:text-lg">{product.category}</h3>
            <p className="line-clamp-1 text-base font-extrabold text-card-foreground md:text-lg">
              {product.discount >= 40 ? 'Best Picks' : product.rating >= 4.5 ? 'Top Rated' : 'New Range'}
            </p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.id}`} className="group min-w-[260px] sm:min-w-[300px] lg:min-w-[320px]">
      <article className="relative isolate min-h-[154px] overflow-hidden rounded-2xl bg-slate-950 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        {image ? (
          <Image src={image} alt={product.title} fill sizes="340px" className="object-cover opacity-85 transition duration-300 group-hover:scale-105" />
        ) : (
          <ProductImagePlaceholder title={product.title} className="bg-slate-900 text-slate-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
        <div className="relative flex min-h-[154px] flex-col justify-between p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-950">{product.discount}% OFF</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold">
              {product.rating.toFixed(1)} <Star className="h-3 w-3 fill-current" />
            </span>
          </div>
          <div>
            <h3 className="line-clamp-1 text-lg font-extrabold">{product.title}</h3>
            <p className="mt-1 text-sm font-semibold text-white/90">From {currency(salePrice)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
