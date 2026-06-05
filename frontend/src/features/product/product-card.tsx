import Link from 'next/link';
import Image from 'next/image';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { Card, CardContent } from '@/components/ui/card';
import { currency, dealPrice } from '@/lib/api';
import { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <ProductImagePlaceholder title={product.title} />
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <div>
            <p className="line-clamp-1 font-medium">{product.title}</p>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-semibold">{currency(dealPrice(product.price, product.discount))}</p>
            <p className="text-sm text-muted-foreground">{product.rating.toFixed(1)} rating</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
