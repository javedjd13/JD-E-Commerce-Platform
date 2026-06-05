'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { Badge, Button, EmptyState, SectionHeader, Skeleton } from '@/components/ui';
import { currency, dealPrice } from '@/lib/api';
import { removeWishlistItem, getWishlist, wishlistKeys } from './wishlist.api';

export function WishlistPanel() {
  const queryClient = useQueryClient();
  const wishlistQuery = useQuery({
    queryKey: wishlistKeys.all,
    queryFn: getWishlist,
    retry: false
  });
  const removeMutation = useMutation({
    mutationFn: removeWishlistItem,
    onSuccess: (data) => {
      queryClient.setQueryData(wishlistKeys.all, { wishlist: data.wishlist });
    }
  });

  if (wishlistQuery.isLoading) {
    return <Skeleton className="h-48" />;
  }

  if (wishlistQuery.isError) {
    return (
      <div>
        <SectionHeader title="My Wishlist" />
        <EmptyState
          className="mt-layout-lg"
          icon={<Heart className="h-8 w-8" />}
          title="Login required"
          description="Wishlist dekhne ke liye login karo."
          action={
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const items = wishlistQuery.data?.wishlist.items ?? [];

  return (
    <div>
      <SectionHeader
        title="My Wishlist"
        description={`${items.length} saved products`}
        action={
          <Link href="/products" className="text-body-sm font-semibold text-primary">
            Browse products
          </Link>
        }
      />

      <div className="mt-7 space-y-4">
        {items.length ? (
          items.map((item) => {
            const salePrice = dealPrice(item.product.price, item.product.discount);

            return (
              <article className="grid gap-component-md border border-border p-component-md sm:grid-cols-[96px_1fr_auto]" key={item.id}>
                <Link href={`/products/${item.product.id}`} className="relative h-24 w-24 overflow-hidden rounded-md bg-muted">
                  {item.product.images?.[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.title} fill sizes="96px" className="object-contain p-component-xs" />
                  ) : (
                    <ProductImagePlaceholder title={item.product.title} />
                  )}
                </Link>

                <div className="min-w-0">
                  <Link href={`/products/${item.product.id}`} className="line-clamp-1 font-semibold text-foreground hover:text-primary">
                    {item.product.title}
                  </Link>
                  <p className="mt-1 text-body-sm text-muted-foreground">{item.product.category}</p>
                  <div className="mt-component-sm flex flex-wrap items-baseline gap-component-xs">
                    <span className="text-body-lg font-bold text-foreground">{currency(salePrice)}</span>
                    <span className="text-body-sm text-muted-foreground line-through">{currency(item.product.price)}</span>
                    <Badge variant="success">{item.product.discount}% off</Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(item.product.id)}
                  className="self-start"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </article>
            );
          })
        ) : (
          <EmptyState
            icon={<Heart className="h-8 w-8" />}
            title="Wishlist empty hai"
            description="Product detail page se heart press karke products save karo."
          />
        )}
      </div>
    </div>
  );
}
