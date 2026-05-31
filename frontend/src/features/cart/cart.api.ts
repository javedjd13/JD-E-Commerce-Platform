import { api } from '@/lib/api';
import { Cart } from '@/types/cart';
import { Order } from '@/types/order';

export function getCart() {
  return api<{ cart: Cart }>('/cart');
}

export function updateCart(productId: string, quantity: number) {
  return api<{ cart: Cart }>('/cart', {
    method: 'PUT',
    body: JSON.stringify({ productId, quantity })
  });
}

export type AddCartItemInput = {
  productId: string;
  quantity?: number;
};

export function addCartItem({ productId, quantity = 1 }: AddCartItemInput) {
  return api<{ cart: Cart }>('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
}

export function updateCartItem(productId: string, quantity: number) {
  return updateCart(productId, quantity);
}

export function removeCartItem(productId: string) {
  return api<{ cart: Cart }>(`/cart/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

export function createOrder() {
  return api<{ order: Order }>('/orders', { method: 'POST' });
}

export function getOrders() {
  return api<{ orders: Order[] }>('/orders');
}
