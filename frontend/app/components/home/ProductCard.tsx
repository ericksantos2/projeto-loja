import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "~/components/CartContext";
import IconButton from "~/components/ui/IconButton";
import { cn } from "~/lib/cn";
import { currencyFormatter, getDiscountPercentage } from "~/lib/formatters";
import { getAssetUrl } from "~/services/api";
import type { Product } from "~/services/products";

export default function ProductCard({ product }: { product: Product }) {
  const price = product.preco ?? 0;
  const originalPrice = product.precoOriginal ?? null;
  const discount = getDiscountPercentage(price, originalPrice);
  const stock = product.estoque ?? 0;
  const { adicionarItem, isAdding } = useCart();
  const adding = isAdding(product.id);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link
          to={`/produtos/${product.id}`}
          aria-label={`Ver detalhes de ${product.nome}`}
          className="block h-full w-full"
        >
          <img
            src={getAssetUrl(product.imagemPrincipal) ?? undefined}
            alt={product.nome}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
        </Link>
        {discount !== null && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-slate-950">
            -{discount}%
          </span>
        )}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          <div className="group/btn relative">
            <IconButton
              aria-label={`Adicionar ${product.nome} ao carrinho`}
              disabled={stock === 0 || adding}
              onClick={() => adicionarItem(product.id)}
              className="bg-white/90 text-slate-950 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              title={
                stock === 0
                  ? "Produto indisponível"
                  : adding
                    ? "Adicionando..."
                    : "Adicionar ao carrinho"
              }
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            {stock === 0 && (
              <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                Esgotado
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 md:p-5">
        <h3 className="font-semibold text-slate-950 md:text-lg">
          {product.nome}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold text-slate-950">
            {currencyFormatter.format(price)}
          </span>
          {originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              {currencyFormatter.format(originalPrice)}
            </span>
          )}
        </div>
        <Link
          to={`/produtos/${product.id}`}
          className={cn(
            "mt-4 block w-full rounded-lg px-3 py-2.5 text-center text-sm font-bold transition",
            stock > 0
              ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
              : "bg-slate-200 text-slate-500 hover:bg-slate-300",
          )}
        >
          {stock > 0 ? "Ver produto" : "Ver produto (indisponível)"}
        </Link>
      </div>
    </article>
  );
}
