import { apiClient } from '@/services/api-client';
import { Product } from '@/types/product';

export type WishlistItem = {
  id: number;
  productId: number;
  createdAt: string;
  product: Product;
};

export type Wishlist = {
  items: WishlistItem[];
  productIds: number[];
  count: number;
};

export type WishlistResponse = {
  wishlist: Wishlist;
};

export type AddWishlistResponse = WishlistResponse & {
  item: WishlistItem;
};

export const wishlistKeys = {
  all: ['wishlist'] as const
};

export function getWishlist() {
  return apiClient<WishlistResponse>('/wishlist', {
    auth: true
  });
}

export function addWishlistItem(productId: number) {
  return apiClient<AddWishlistResponse>(`/wishlist/${productId}`, {
    method: 'POST',
    auth: true
  });
}

export function removeWishlistItem(productId: number) {
  return apiClient<WishlistResponse>(`/wishlist/${productId}`, {
    method: 'DELETE',
    auth: true
  });
}
