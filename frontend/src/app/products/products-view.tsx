'use client';

import { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductsPageSkeleton } from '@/components/common/loading-skeletons';
import { ProductsResponse, getProductsClient, productKeys } from '@/features/product/product.api';
import { ProductFilters } from '@/types/product';

type ProductsViewProps = {
  filters: ProductFilters;
  initialProducts: ProductsResponse;
};

export function ProductsView({ filters, initialProducts }: ProductsViewProps) {
  const router = useRouter();
  const productsQuery = useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProductsClient(filters),
    initialData: initialProducts,
    placeholderData: (previous) => previous,
    refetchOnMount: 'always',
    staleTime: 60_000
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    ['search', 'category', 'minPrice', 'maxPrice', 'rating'].forEach((key) => {
      const value = String(formData.get(key) || '').trim();
      if (value) params.set(key, value);
    });

    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  }

  if (productsQuery.isLoading) return <ProductsPageSkeleton />;

  if (productsQuery.isError || !productsQuery.data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold">Products load nahi ho paaye</h1>
          <p className="mt-2 text-sm text-slate-500">Backend API connection check karke retry karo.</p>
          <button
            type="button"
            onClick={() => productsQuery.refetch()}
            className="mt-5 h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { products, filters: availableFilters } = productsQuery.data;

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-lg font-bold">Filters</h1>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <input name="search" defaultValue={filters.search} placeholder="Search products" className="h-11 w-full rounded-xl border px-3 text-sm" />
          <select name="category" defaultValue={filters.category || ''} className="h-11 w-full rounded-xl border px-3 text-sm">
            <option value="">All categories</option>
            {availableFilters.categories.map(({ category }) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input name="minPrice" defaultValue={filters.minPrice} placeholder="Min" className="h-11 rounded-xl border px-3 text-sm" />
            <input name="maxPrice" defaultValue={filters.maxPrice} placeholder="Max" className="h-11 rounded-xl border px-3 text-sm" />
          </div>
          <select name="rating" defaultValue={filters.rating || ''} className="h-11 w-full rounded-xl border px-3 text-sm">
            <option value="">Any rating</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
          <button className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white">Apply</button>
        </form>
      </aside>
      <section className="space-y-4">
        <div className="flex items-end justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-sm font-semibold text-blue-700">Products</p>
            <h2 className="text-2xl font-bold">{products.length} items found</h2>
          </div>
          <p className="text-sm text-slate-500">Sorted by rating</p>
        </div>
        <div className="grid gap-[3px] overflow-hidden rounded-2xl bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
