'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authKeys } from '@/lib/auth';
import { getCurrentUser, login, LoginInput, logoutRequest, signup, SignupInput, updateProfile } from './auth.api';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: getCurrentUser,
    retry: false
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, { user: data.user });
      router.push('/dashboard');
    }
  });

  const signupMutation = useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, { user: data.user });
      router.push('/dashboard');
    }
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data);
    }
  });

  async function logout() {
    await logoutRequest().catch(() => undefined);
    queryClient.removeQueries({ queryKey: ['auth'] });
    queryClient.removeQueries({ queryKey: ['bookings'] });
    router.push('/login');
  }

  return {
    user: userQuery.data?.user,
    isAuthenticated: Boolean(userQuery.data?.user),
    isUserLoading: userQuery.isLoading,
    login: loginMutation,
    signup: signupMutation,
    updateProfile: profileMutation,
    logout
  };
}
