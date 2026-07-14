'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AddCartItemInput, addCartItem, getCart, removeCartItem, updateCartItem } from './cart.api';
import { setCount } from '@/store/cartStore';
import { useAppDispatch } from '@/store/hooks';
import { Cart } from '@/types/cart';
import { useAuth } from '@/hooks/useAuth';

export const cartKeys = {
  all: ['cart'] as const
};

export function useCart() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user, isLoading: isAuthLoading } = useAuth();
  const cartQuery = useQuery({
    queryKey: cartKeys.all,
    queryFn: getCart,
    retry: false,
    enabled: Boolean(user)
  });

  function syncCart(cart: Cart) {
    dispatch(setCount(cart.items.reduce((sum, item) => sum + item.quantity, 0)));
    queryClient.setQueryData(cartKeys.all, { cart });
  }

  useEffect(() => {
    if (cartQuery.data?.cart) syncCart(cartQuery.data.cart);
  }, [cartQuery.data?.cart]);

  return {
    cart: cartQuery.data?.cart,
    isLoading: isAuthLoading || cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,
    addItem: useMutation({
      mutationFn: (input: AddCartItemInput) => addCartItem(input),
      onSuccess: (data) => syncCart(data.cart)
    }),
    updateItem: useMutation({
      mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => updateCartItem(productId, quantity),
      onSuccess: (data) => syncCart(data.cart)
    }),
    removeItem: useMutation({
      mutationFn: removeCartItem,
      onSuccess: (data) => syncCart(data.cart)
    })
  };
}
