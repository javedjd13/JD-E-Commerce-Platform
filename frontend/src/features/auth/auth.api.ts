import { apiClient } from '@/services/api-client';
import { AuthResponse, User } from '@/types/user';

export type SignupInput = {
  email: string;
  password: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export function signup(input: SignupInput) {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function login(input: LoginInput) {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function getCurrentUser() {
  return apiClient<AuthResponse>('/auth/me', {
    auth: true
  });
}

export function updateProfile(input: Pick<User, 'name' | 'email'>) {
  return apiClient<AuthResponse>('/auth/me', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(input)
  });
}

export function logoutRequest() {
  return apiClient<void>('/auth/logout', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({})
  });
}
