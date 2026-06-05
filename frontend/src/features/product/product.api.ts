import { Product, ProductFilters } from '@/types/product';
import { serverApi } from '@/services/server-api';
import { api } from '@/lib/api';

export type ProductsResponse = {
  products: Product[];
  filters: { categories: { category: string }[] };
};

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters = {}) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...productKeys.details(), id] as const
};

function toQuery(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getProducts(filters?: ProductFilters) {
  return serverApi<ProductsResponse>(`/products${toQuery(filters)}`, { cache: 'no-store' });
}

export function getProductsClient(filters?: ProductFilters) {
  return api<ProductsResponse>(`/products${toQuery(filters)}`);
}

export function getProduct(id: string | number) {
  return serverApi<{ product: Product }>(`/products/${id}`, { cache: 'no-store' });
}

export function getProductClient(id: string | number) {
  return api<{ product: Product }>(`/products/${id}`);
}
