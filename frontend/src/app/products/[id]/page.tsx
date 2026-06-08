import { getProduct } from '@/features/product/product.api';
import { ProductDetailView } from './product-detail-view';

export const dynamic = 'force-dynamic';

type ProductDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  const { product } = await getProduct(id);

  return <ProductDetailView productId={id} initialProduct={product} />;
}
