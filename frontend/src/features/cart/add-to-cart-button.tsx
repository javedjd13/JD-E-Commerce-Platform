'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './use-cart';

export function AddToCartButton({ productId }: { productId: string }) {
  const { addItem } = useCart();

  return (
    <Button onClick={() => addItem.mutate({ productId, quantity: 1 })} disabled={addItem.isPending}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      {addItem.isPending ? 'Adding' : 'Add to cart'}
    </Button>
  );
}
