'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { addWishlistItem, getWishlist, removeWishlistItem, wishlistKeys } from './wishlist.api';

type WishlistButtonProps = {
  productId: number;
  className?: string;
  showLabel?: boolean;
};

export function WishlistButton({ productId, className, showLabel = true }: WishlistButtonProps) {
  const queryClient = useQueryClient();
  const wishlistQuery = useQuery({
    queryKey: wishlistKeys.all,
    queryFn: getWishlist,
    retry: false
  });
  const isWishlisted = wishlistQuery.data?.wishlist.productIds.includes(productId) ?? false;
  const mutation = useMutation({
    mutationFn: () => (isWishlisted ? removeWishlistItem(productId) : addWishlistItem(productId)),
    onSuccess: (data) => {
      queryClient.setQueryData(wishlistKeys.all, { wishlist: data.wishlist });
    }
  });

  return (
    <button
      type="button"
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={wishlistQuery.isError ? 'Login to use wishlist' : isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || wishlistQuery.isLoading}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60',
        isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600' : '',
        className
      )}
    >
      <Heart className={cn('h-5 w-5', isWishlisted ? 'fill-current' : '')} />
      {showLabel ? (mutation.isPending ? 'Saving' : isWishlisted ? 'Wishlisted' : 'Wishlist') : null}
    </button>
  );
}
