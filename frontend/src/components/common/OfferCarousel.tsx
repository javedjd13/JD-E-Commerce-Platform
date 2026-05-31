'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Product } from '@/types/product';
import { currency, dealPrice } from '@/lib/api';

const tones = [
  'from-sky-50 via-white to-cyan-100 text-slate-950',
  'from-slate-950 via-emerald-950 to-slate-900 text-white',
  'from-amber-100 via-orange-100 to-stone-200 text-slate-950'
];

export function OfferCarousel({ products }: { products: Product[] }) {
  const banners = products.slice(0, 5);
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  if (!banners.length) return null;

  function scrollToBanner(index: number) {
    const rail = railRef.current;
    const item = rail?.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  function onScroll() {
    const rail = railRef.current;
    if (!rail) return;

    const closestIndex = Array.from(rail.children).reduce(
      (closest, child, index) => {
        const distance = Math.abs((child as HTMLElement).offsetLeft - rail.scrollLeft);
        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );

    setActive(closestIndex.index);
  }

  return (
    <section className="overflow-hidden">
      <div ref={railRef} onScroll={onScroll} className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto">
        {banners.map((product, index) => (
          <HomeBannerCard product={product} index={index} key={product.id} />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {banners.map((product, index) => (
          <button
            type="button"
            aria-label={`Go to banner ${index + 1}`}
            onClick={() => scrollToBanner(index)}
            className={active === index ? 'h-1.5 w-7 rounded-full bg-slate-600' : 'h-1.5 w-1.5 rounded-full bg-slate-300'}
            key={product.id}
          />
        ))}
      </div>
    </section>
  );
}

function HomeBannerCard({ product, index }: { product: Product; index: number }) {
  const salePrice = dealPrice(product.price, product.discount);
  const isCompact = index % 3 === 2;

  return (
    <Link
      href={`/products/${product.id}`}
      className={isCompact ? 'group block min-w-[245px] snap-start sm:min-w-[300px]' : 'group block min-w-[86vw] snap-start sm:min-w-[560px] lg:min-w-[575px]'}
    >
      <article className={`relative isolate h-[178px] overflow-hidden rounded-2xl bg-gradient-to-br ${tones[index % tones.length]} shadow-sm ring-1 ring-slate-200 md:h-[205px]`}>
        <div className="relative z-10 flex h-full items-center gap-3 px-5 py-4 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="mb-2 line-clamp-1 text-sm font-extrabold opacity-80">{brandLine(product, index)}</p>
            <h2 className="max-w-sm text-[1.55rem] font-black leading-tight md:text-3xl">
              {headlineFor(product, index)}
            </h2>
            <p className="mt-1 text-lg font-black md:text-2xl">From {currency(salePrice)}</p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold opacity-80 md:text-base">
              {sublineFor(product, index)}
            </p>
          </div>

          <div className={isCompact ? 'relative h-32 w-24 shrink-0 sm:h-36 sm:w-32' : 'relative h-40 w-36 shrink-0 sm:h-48 sm:w-52'}>
            <Image
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'}
              alt={product.title}
              fill
              sizes={isCompact ? '150px' : '240px'}
              className="object-contain drop-shadow-2xl transition duration-300 group-hover:scale-105"
              priority={index === 0}
            />
          </div>
        </div>

        <span className="absolute bottom-3 right-4 rounded bg-white/80 px-2 py-1 text-xs font-black text-slate-600 shadow-sm">AD</span>
      </article>
    </Link>
  );
}

function brandLine(product: Product, index: number) {
  if (index === 0) return `${product.category} | NovaCart`;
  if (index === 1) return product.title.split(' ').slice(0, 3).join(' ');
  return 'Mega deals';
}

function headlineFor(product: Product, index: number) {
  if (index === 0) return `${product.discount}% | Pre-book now`;
  if (index === 1) return 'See it bright & vivid';
  return `Up to ${product.discount}% Off`;
}

function sublineFor(product: Product, index: number) {
  if (index === 0) return product.title.split(' ').slice(0, 5).join(' ');
  if (index === 1) return product.category;
  return 'Satisfaction in every pick';
}
