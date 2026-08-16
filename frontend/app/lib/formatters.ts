export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function getDiscountPercentage(price: number, originalPrice: number | null) {
  if (!originalPrice) return null;
  return Math.round((1 - price / originalPrice) * 100);
}
