type ProductLike = {
  publicId: number;
  price: unknown;
  rating: unknown;
  [key: string]: unknown;
};

export function serializeProduct(product: ProductLike) {
  const { publicId, ...rest } = product;

  return {
    ...rest,
    id: publicId,
    price: Number(product.price),
    rating: Number(product.rating)
  };
}
