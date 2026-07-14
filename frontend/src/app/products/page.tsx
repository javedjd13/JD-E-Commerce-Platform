import { getProducts } from '@/features/product/product.api';
import { ProductFilters } from '@/types/product';
import { ProductsView } from './products-view';

export const dynamic = 'force-dynamic';

type ProductsPageProps = {
  searchParams: Promise<ProductFilters>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;
  const initialProducts = await getProducts(filters);

  return <ProductsView filters={filters} initialProducts={initialProducts} />;
}
