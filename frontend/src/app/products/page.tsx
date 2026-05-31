import { ProductFilters } from '@/types/product';
import { ProductsView } from './products-view';

type ProductsPageProps = {
  searchParams: Promise<ProductFilters>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;
  return <ProductsView filters={filters} />;
}
