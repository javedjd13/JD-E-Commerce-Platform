import { Product } from './product';

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Product;
};

export type Cart = {
  id: number;
  items: CartItem[];
  subtotal: number;
};
