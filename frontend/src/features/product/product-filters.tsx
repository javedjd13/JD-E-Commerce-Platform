'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { ProductFilters } from '@/types/product';
import { ProductCard } from './product-card';
import { ProductsResponse, getProductsClient, productKeys } from './product.api';

type ProductFiltersClientProps = {
  initialFilters: ProductFilters;
  initialProducts: ProductsResponse;
};

export function ProductFiltersClient({ initialFilters, initialProducts }: ProductFiltersClientProps) {
  const [query, setQuery] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const debouncedQuery = useDebounce(query);

  const filters: ProductFilters = {
    ...initialFilters,
    search: debouncedQuery,
    category
  };

  const productsQuery = useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProductsClient(filters),
    initialData: initialProducts,
    placeholderData: (previous) => previous
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {productsQuery.data.filters.categories.map(({ category }) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {productsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4]" />
          ))}
        </div>
      ) : productsQuery.data.products.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {productsQuery.data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border py-16 text-center text-muted-foreground">No products found.</div>
      )}
    </section>
  );
}
