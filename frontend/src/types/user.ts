export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'USER' | 'ADMIN';
};

export type AuthResponse = {
  user: User;
};
