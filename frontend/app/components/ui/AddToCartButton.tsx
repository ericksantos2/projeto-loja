import { ShoppingCart } from "lucide-react";
import type { ComponentProps } from "react";
import { useCart } from "~/components/CartContext";
import { cn } from "~/lib/cn";

type AddToCartButtonProps = ComponentProps<"button"> & {
  available: boolean;
  produtoId: string;
  quantidade?: number;
};

export default function AddToCartButton({
  available,
  produtoId,
  quantidade = 1,
  className,
  type = "button",
  ...props
}: AddToCartButtonProps) {
  const { adicionarItem, isAdding } = useCart();
  const adding = isAdding(produtoId);

  return (
    <button
      type={type}
      disabled={!available || adding}
      onClick={() => adicionarItem(produtoId, quantidade)}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500",
        className,
      )}
      {...props}
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      {!available ? "Indisponível" : adding ? "Adicionando..." : "Adicionar ao carrinho"}
    </button>
  );
}
