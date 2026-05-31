'use client';

import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/features/cart/use-cart';

export function AddToCartPanel({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
        className="h-12 w-24 rounded-xl border px-3"
      />
      <button
        type="button"
        onClick={() => addItem.mutate({ productId, quantity })}
        disabled={addItem.isPending}
        className="flex h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        <ShoppingCart className="h-5 w-5" />
        {addItem.isPending ? 'Adding' : 'Add to Cart'}
      </button>
    </div>
  );
}
