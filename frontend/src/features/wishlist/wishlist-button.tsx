'use client';

import { useMutation } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addWishlistItem } from './wishlist.api';

export function WishlistButton({ productId }: { productId: string }) {
  const mutation = useMutation({
    mutationFn: () => addWishlistItem(productId)
  });

  return (
    <Button variant="outline" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      <Heart className="mr-2 h-4 w-4" />
      Wishlist
    </Button>
  );
}
