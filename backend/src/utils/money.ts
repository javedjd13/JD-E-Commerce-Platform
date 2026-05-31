export function productPrice(price: unknown, discount = 0) {
  const base = Number(price);
  return Math.round(base * (1 - discount / 100) * 100) / 100;
}
