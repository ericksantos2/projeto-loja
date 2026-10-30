export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function getDiscountPercentage(price: number | null | undefined, originalPrice: number | null | undefined) {
  const numericPrice = Number(price ?? 0);
  const numericOriginalPrice = Number(originalPrice ?? 0);

  if (!Number.isFinite(numericPrice) || !Number.isFinite(numericOriginalPrice) || numericOriginalPrice <= 0) {
    return null;
  }

  return Math.round((1 - numericPrice / numericOriginalPrice) * 100);
}
