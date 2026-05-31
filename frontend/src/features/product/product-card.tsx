import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { currency, dealPrice } from '@/lib/api';
import { Product } from '@/types/product';

function productImage(product: Product) {
  const image = product.images?.[0];
  return image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          <Image
            src={productImage(product)}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
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
