export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discount: number;
  images: string[];
  category: string;
  rating: number;
  stock?: number;
  tags?: string[];
};

export type ProductFilters = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
};
