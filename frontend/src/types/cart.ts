import { Product } from './product';

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Product;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
};
