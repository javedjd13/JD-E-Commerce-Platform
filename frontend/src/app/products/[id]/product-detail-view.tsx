'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductDetailPageSkeleton } from '@/components/common/loading-skeletons';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { getProductClient, productKeys } from '@/features/product/product.api';
import { WishlistButton } from '@/features/wishlist/wishlist-button';
import { currency, dealPrice } from '@/lib/api';
import { Product } from '@/types/product';
import { cn } from '@/utils/cn';
import { AddToCartPanel } from './product-actions';

type ProductDetailViewProps = {
  productId: string;
  initialProduct: Product;
};

export function ProductDetailView({ productId, initialProduct }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const productQuery = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductClient(productId),
    initialData: { product: initialProduct },
    enabled: Boolean(productId),
    refetchOnMount: 'always',
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const product = productQuery.data?.product;
  const images = useMemo(() => {
    return product?.images?.filter(Boolean) ?? [];
  }, [product?.images]);

  if (productQuery.isLoading) return <ProductDetailPageSkeleton />;

  if (productQuery.isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-950">Product load nahi ho paaya</h1>
          <p className="mt-2 text-sm text-slate-500">Backend API se data nahi mila. Server chalu hai aur product id valid hai, yeh check kar lo.</p>
          <button
            type="button"
            onClick={() => productQuery.refetch()}
            className="mt-5 h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const salePrice = dealPrice(product.price, product.discount);

  return (
    <main className="mx-auto max-w-7xl px-4 py-4">
      <Breadcrumb category={product.category} title={product.title} />

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="grid gap-3 md:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:block md:space-y-2 md:overflow-visible">
            {images.length ? (
              images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white',
                    selectedImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                  )}
                >
                  <Image src={image} alt={`${product.title} image ${index + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))
            ) : (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <ProductImagePlaceholder title={product.title} />
              </div>
            )}
          </div>

          <div className="order-1 grid gap-3 sm:grid-cols-2 md:order-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              {images[selectedImage] ? (
                <Image src={images[selectedImage]} alt={product.title} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" priority />
              ) : (
                <ProductImagePlaceholder title={product.title} />
              )}
              <WishlistButton productId={product.id} showLabel={false} className="absolute right-3 top-3 h-10 w-10 rounded-full p-0 text-rose-500" />
            </div>
            <div className="hidden grid-rows-2 gap-3 sm:grid">
              {images.slice(1, 3).map((image, index) => (
                <div className="relative overflow-hidden rounded-2xl bg-slate-100" key={`${image}-preview-${index}`}>
                  <Image src={image} alt={`${product.title} preview ${index + 1}`} fill sizes="260px" className="object-cover" />
                </div>
              ))}
              {!images.slice(1, 3).length && (
                <div className="relative row-span-2 overflow-hidden rounded-2xl bg-slate-100">
                  <ProductImagePlaceholder title={product.title} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-blue-700">{product.category}</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-950 md:text-3xl">{product.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-sm font-bold text-white">
                {product.rating.toFixed(1)} <Star className="h-4 w-4 fill-current" />
              </span>
              <span className="text-sm text-slate-500">Backend API product id: {product.id}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{product.description}</p>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-extrabold text-slate-950">{currency(salePrice)}</span>
              <span className="text-sm text-slate-400 line-through">{currency(product.price)}</span>
              <span className="text-sm font-bold text-emerald-700">{product.discount}% off</span>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Bank and exchange offers</p>
                <p className="text-xs text-blue-100">Best available discount applied at checkout.</p>
              </div>
              <span className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-blue-700">Save more</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-bold text-slate-950">Delivery details</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <InfoRow icon={<Truck className="h-4 w-4" />} title="Delivery in 2 days" detail="Free delivery for eligible orders" />
              <InfoRow icon={<RotateCcw className="h-4 w-4" />} title="7 days replacement" detail="Easy replacement on damaged products" />
              <InfoRow icon={<ShieldCheck className="h-4 w-4" />} title="Secure checkout" detail="Protected payment and order tracking" />
            </div>
          </div>

          <div className="sticky bottom-0 z-20 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 lg:static lg:shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <AddToCartPanel productId={product.id} />
              <WishlistButton productId={product.id} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Breadcrumb({ category, title }: { category: string; title: string }) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500">
      <Link href="/" className="hover:text-blue-700">Home</Link>
      <ChevronRight className="h-3 w-3" />
      <Link href={`/products?category=${encodeURIComponent(category)}`} className="hover:text-blue-700">{category}</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="line-clamp-1 text-slate-700">{title}</span>
    </nav>
  );
}

function InfoRow({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <span className="mt-0.5 text-blue-600">{icon}</span>
      <span>
        <span className="block font-semibold text-slate-900">{title}</span>
        <span className="text-xs text-slate-500">{detail}</span>
      </span>
    </div>
  );
}
