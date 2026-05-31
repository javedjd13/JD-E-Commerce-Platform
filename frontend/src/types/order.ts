import { Product } from './product';

export type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: Pick<Product, 'id' | 'title' | 'images'>;
  }[];
};
