import { currencyFormatter, getDiscountPercentage } from "~/lib/formatters";

type PriceTagProps = {
  price: number;
  originalPrice: number | null;
  size?: "sm" | "lg";
  showDiscount?: boolean;
};

export default function PriceTag({
  price,
  originalPrice,
  size = "lg",
  showDiscount = true,
}: PriceTagProps) {
  const discount = getDiscountPercentage(price, originalPrice);
  const priceClass = size === "lg" ? "text-3xl font-bold" : "font-bold";

  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
      <span className={`${priceClass} text-slate-950`}>
        {currencyFormatter.format(price)}
      </span>
      {originalPrice && (
        <span
          className={`${size === "lg" ? "text-base" : "text-sm"} text-slate-400 line-through`}
        >
          {currencyFormatter.format(originalPrice)}
        </span>
      )}
      {showDiscount && discount && (
        <span className="rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-slate-950">
          -{discount}%
        </span>
      )}
    </div>
  );
}
