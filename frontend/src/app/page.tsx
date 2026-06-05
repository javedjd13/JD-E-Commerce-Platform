import { CategoryNav } from '@/components/common/CategoryNav';
import { OfferCarousel } from '@/components/common/OfferCarousel';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductRail } from '@/components/common/ProductRail';
import { getProducts } from '@/features/product/product.api';
import { Product } from '@/types/product';
import { dealPrice } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  const { products } = await getProducts();
  const bannerProducts = byTag(products, 'banner', 10);
  const suggested = byTag(products, 'featured', 8, (product) => product.discount >= 35);
  const trending = byTag(products, 'top-rated', 8, (product) => product.rating >= 4.5);
  const productGrid = products.slice(0, 8);
  const deals = byTag([...products].sort((a, b) => b.discount - a.discount), 'deal', 8, (product) => product.discount >= 30);
  const everybody = products.slice(4, 8);
  const collections = products.slice(8, 12).length ? products.slice(8, 12) : products.slice(0, 4);
  const freshPicks = products.slice(12, 16).length ? products.slice(12, 16) : products.slice(4, 8);

  return (
    <>
        <CategoryNav />
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-5">
        <OfferCarousel products={bannerProducts.length ? bannerProducts : products.slice(0, 10)} />
        <ProductRail title="Top Rated" products={trending.length ? trending.slice(0, 4) : products.slice(0, 4)} tone="spotlight" />
        <ProductRail title="Featured Brands" products={suggested.length ? suggested : products.slice(0, 8)} />
        <HomeDealSection title="Fresh picks for you" products={freshPicks} tone="cool" />
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-foreground">Products</h2>
          </div>
          <div className="grid gap-[3px] overflow-hidden rounded-2xl bg-muted sm:grid-cols-2 xl:grid-cols-4">
            {productGrid.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </section>
        <HomeDealSection title="On everybody's list" products={everybody} tone="sunny" />
        <ProductRail title="Best Deals" products={deals} />
        <HomeDealSection title="Top collections" products={collections} tone="fire" />
      </div>
    </>
  );
}

function HomeDealSection({ title, products, tone }: { title: string; products: Product[]; tone: 'sunny' | 'fire' | 'cool' }) {
  if (!products.length) return null;

  const toneClasses = {
    sunny: 'from-yellow-300 via-amber-300 to-orange-300 text-slate-950',
    fire: 'from-orange-700 via-orange-600 to-rose-600 text-white',
    cool: 'from-blue-900 via-indigo-900 to-violet-900 text-white'
  };

  const innerClass = tone === 'sunny' ? 'bg-white/88 text-slate-950' : 'bg-white/10 text-white ring-1 ring-white/15';

  return (
    <section className={`overflow-hidden rounded-3xl bg-gradient-to-br ${toneClasses[tone]} p-3 shadow-sm md:p-4`}>
      <div className="flex items-center justify-between px-2 pb-3">
        <h2 className="text-2xl font-black md:text-3xl">{title}</h2>
        <Link href="/products" className={tone === 'sunny' ? 'rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white' : 'rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950'}>
          View all
        </Link>
      </div>
      <div className={`grid gap-3 rounded-2xl p-3 sm:grid-cols-2 lg:grid-cols-4 ${innerClass}`}>
        {products.slice(0, 4).map((product, index) => (
          <Link href={`/products/${product.id}`} className="group min-w-0" key={product.id}>
            <article className="min-w-0">
              <div className={tone === 'sunny' ? 'relative aspect-[1.35] overflow-hidden rounded-xl bg-slate-100' : 'relative aspect-[1.35] overflow-hidden rounded-xl bg-slate-950/35'}>
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.title} fill sizes="(max-width: 1024px) 50vw, 300px" className="object-contain p-2 transition duration-300 group-hover:scale-105" />
                ) : null}
              </div>
              <h3 className="mt-3 line-clamp-1 text-base font-medium">{sectionTitle(product, index)}</h3>
              <p className="line-clamp-1 text-lg font-black">{sectionSubtitle(product, tone)}</p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function sectionTitle(product: Product, index: number) {
  const labels = ['Loose fits & more', 'Classic picks & more', 'Running deals', 'Best selling picks'];
  return product.category || labels[index % labels.length];
}

function sectionSubtitle(product: Product, tone: 'sunny' | 'fire' | 'cool') {
  if (tone === 'sunny') return product.discount >= 40 ? 'Min 70% Off' : `Min ${Math.max(30, product.discount)}% Off`;
  if (tone === 'fire') return product.rating >= 4.6 ? 'Top Collection' : 'Popular';
  return `From ${formatRupees(dealPrice(product.price, product.discount))}`;
}

function formatRupees(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function byTag(products: Product[], tag: string, limit: number, fallback?: (product: Product) => boolean) {
  const tagged = products.filter((product) => product.tags?.includes(tag));
  if (tagged.length) return tagged.slice(0, limit);
  return (fallback ? products.filter(fallback) : products).slice(0, limit);
}
