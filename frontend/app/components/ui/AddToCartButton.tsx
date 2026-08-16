import { ShoppingCart } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/cn";

type AddToCartButtonProps = ComponentProps<"button"> & {
  available: boolean;
};

export default function AddToCartButton({ available, className, type = "button", ...props }: AddToCartButtonProps) {
  return (
    <button
      type={type}
      disabled={!available}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500",
        className,
      )}
      {...props}
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      {available ? "Adicionar ao carrinho" : "Indisponível"}
    </button>
  );
}
