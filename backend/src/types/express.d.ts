export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: 'USER' | 'ADMIN';
        email: string;
      };
    }
  }
}

export {};
