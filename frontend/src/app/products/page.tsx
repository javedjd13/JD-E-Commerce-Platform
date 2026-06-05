import { getProducts } from '@/features/product/product.api';
import { ProductFilters } from '@/types/product';
import { ProductsView } from './products-view';

type ProductsPageProps = {
  searchParams: Promise<ProductFilters>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;
  const initialProducts = await getProducts(filters);

  return <ProductsView filters={filters} initialProducts={initialProducts} />;
}
