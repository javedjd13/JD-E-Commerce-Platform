import { User } from '@/types/user';
import { api } from './api';

export type AuthResponse = { user: User };

export const authKeys = {
  me: ['auth', 'me'] as const
};

export function getMe() {
  return api<AuthResponse>('/auth/me');
}

export function login(input: { email: string; password: string }) {
  return api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function register(input: { name: string; email: string; password: string }) {
  return api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function logout() {
  return api<void>('/auth/logout', { method: 'POST' });
}
