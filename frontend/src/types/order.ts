import { Product } from './product';
import { UserAddress } from './user';

export type Order = {
  id: number;
  status: string;
  totalAmount: number;
  listingAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: string;
  deliveredAt?: string;
  shippingAddress?: UserAddress | null;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  items: {
    id: number;
    quantity: number;
    price: number;
    listingPrice?: number;
    discount?: number;
    product: Pick<Product, 'id' | 'title' | 'images' | 'category'>;
  }[];
};
