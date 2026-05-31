import { Product } from './product';
import { UserAddress } from './user';

export type Order = {
  id: string;
  status: string;
  totalAmount: number;
  listingAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  createdAt: string;
  deliveredAt?: string;
  shippingAddress?: UserAddress | null;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    listingPrice?: number;
    discount?: number;
    product: Pick<Product, 'id' | 'title' | 'images' | 'category'>;
  }[];
};
