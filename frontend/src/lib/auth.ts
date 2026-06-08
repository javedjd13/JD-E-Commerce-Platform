import { User, UserAddress } from "@/types/user";
import { api } from "./api";

export type AuthResponse = { user: User | null };
export type ProfileInput = {
  name: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  panNumber?: string;
};
export type AddressInput = Omit<UserAddress, "id">;

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function getMe() {
  return api<AuthResponse>("/auth/me");
}

export function login(input: { email: string; password: string }) {
  return api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  return api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return api<void>("/auth/logout", { method: "POST" });
}

export function updateProfile(input: ProfileInput) {
  return api<AuthResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function createAddress(input: AddressInput) {
  return api<AuthResponse>("/auth/me/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAddress(addressId: number, input: AddressInput) {
  return api<AuthResponse>(`/auth/me/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteAddress(addressId: number) {
  return api<AuthResponse>(`/auth/me/addresses/${addressId}`, {
    method: "DELETE",
  });
}
