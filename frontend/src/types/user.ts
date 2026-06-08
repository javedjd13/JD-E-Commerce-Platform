export type UserAddress = {
  id: number;
  label?: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type ContactInformation = {
  fullName: string;
  email: string;
  phone?: string | null;
};

export type User = {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  role: 'user' | 'admin' | 'USER' | 'ADMIN';
  profileImageUrl?: string;
  panNumber?: string | null;
  contactInformation?: ContactInformation;
  addresses?: UserAddress[];
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: User | null;
};
