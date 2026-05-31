import { apiClient } from '@/services/api-client';

export function addWishlistItem(productId: string) {
  return apiClient(`/wishlist/${productId}`, {
    method: 'POST',
    auth: true
  });
}

export function removeWishlistItem(productId: string) {
  return apiClient<void>(`/wishlist/${productId}`, {
    method: 'DELETE',
    auth: true
  });
}
