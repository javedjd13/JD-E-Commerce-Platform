import { CategoryNav } from '@/components/common/CategoryNav';
import { OfferCarousel } from '@/components/common/OfferCarousel';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductRail } from '@/components/common/ProductRail';
import { getProducts } from '@/features/product/product.api';
import { Product } from '@/types/product';

export default async function HomePage() {
  const { products } = await getProducts();
  const bannerProducts = byTag(products, 'banner', 5);
  const suggested = byTag(products, 'featured', 8, (product) => product.discount >= 35);
  const trending = byTag(products, 'top-rated', 8, (product) => product.rating >= 4.5);
  const productGrid = products.slice(0, 8);
  const deals = byTag([...products].sort((a, b) => b.discount - a.discount), 'deal', 8, (product) => product.discount >= 30);

  return (
    <>
      <CategoryNav />
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5">
        <OfferCarousel products={bannerProducts.length ? bannerProducts : products.slice(0, 3)} />
        <ProductRail title="Top Rated" products={trending.length ? trending.slice(0, 4) : products.slice(0, 4)} tone="spotlight" />
        <ProductRail title="Featured Brands" products={suggested.length ? suggested : products.slice(0, 8)} />
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-950">Products</h2>
          </div>
          <div className="grid gap-[3px] overflow-hidden rounded-2xl bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
            {productGrid.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </section>
        <ProductRail title="Best Deals" products={deals} />
      </div>
    </>
  );
}

function byTag(products: Product[], tag: string, limit: number, fallback?: (product: Product) => boolean) {
  const tagged = products.filter((product) => product.tags?.includes(tag));
  if (tagged.length) return tagged.slice(0, limit);
  return (fallback ? products.filter(fallback) : products).slice(0, limit);
}
