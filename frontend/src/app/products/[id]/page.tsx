import { ProductDetailView } from './product-detail-view';

type ProductDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  return <ProductDetailView productId={id} />;
}
