'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/lib/auth';

export function useAuth() {
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: authApi.authKeys.me,
    queryFn: authApi.getMe,
    retry: false
  });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => queryClient.setQueryData(authApi.authKeys.me, data)
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => queryClient.setQueryData(authApi.authKeys.me, data)
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => queryClient.clear()
  });

  const updateProfile = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => queryClient.setQueryData(authApi.authKeys.me, data)
  });

  const createAddress = useMutation({
    mutationFn: authApi.createAddress,
    onSuccess: (data) => queryClient.setQueryData(authApi.authKeys.me, data)
  });

  const updateAddress = useMutation({
    mutationFn: ({ addressId, input }: { addressId: string; input: authApi.AddressInput }) => authApi.updateAddress(addressId, input),
    onSuccess: (data) => queryClient.setQueryData(authApi.authKeys.me, data)
  });

  const deleteAddress = useMutation({
    mutationFn: authApi.deleteAddress,
    onSuccess: (data) => queryClient.setQueryData(authApi.authKeys.me, data)
  });

  return {
    user: me.data?.user,
    isLoading: me.isLoading,
    login,
    register,
    logout,
    updateProfile,
    createAddress,
    updateAddress,
    deleteAddress
  };
}
