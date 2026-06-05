import { api } from '@/lib/api';
import { Cart } from '@/types/cart';
import { Order } from '@/types/order';

export function getCart() {
  return api<{ cart: Cart }>('/cart');
}

export function updateCart(productId: number, quantity: number) {
  return api<{ cart: Cart }>('/cart', {
    method: 'PUT',
    body: JSON.stringify({ productId, quantity })
  });
}

export type AddCartItemInput = {
  productId: number;
  quantity?: number;
};

export function addCartItem({ productId, quantity = 1 }: AddCartItemInput) {
  return api<{ cart: Cart }>('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
}

export function updateCartItem(productId: number, quantity: number) {
  return updateCart(productId, quantity);
}

export function removeCartItem(productId: number) {
  return api<{ cart: Cart }>(`/cart/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

export function createOrder() {
  return api<{ order: Order }>('/orders', { method: 'POST' });
}

export type RazorpayOrderResponse = {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customer: {
    name: string;
    email: string;
    contact?: string;
  };
};

export type RazorpayVerifyInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export function createRazorpayOrder() {
  return api<RazorpayOrderResponse>('/orders/razorpay/create', { method: 'POST' });
}

export function verifyRazorpayPayment(input: RazorpayVerifyInput) {
  return api<{ order: Order }>('/orders/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function getOrders() {
  return api<{ orders: Order[] }>('/orders');
}

export function getOrder(orderId: string) {
  return api<{ order: Order }>(`/orders/${encodeURIComponent(orderId)}`);
}
