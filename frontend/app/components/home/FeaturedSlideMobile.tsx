import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "~/components/CartContext";
import IconButton from "~/components/ui/IconButton";
import { cn } from "~/lib/cn";
import { currencyFormatter, getDiscountPercentage } from "~/lib/formatters";
import { getAssetUrl } from "~/services/api";
import type { Product } from "~/services/products";

interface FeaturedSlideMobileProps {
  product: Product;
}

export function FeaturedSlideMobile({ product }: FeaturedSlideMobileProps) {
  const price = product.preco ?? 0;
  const originalPrice = product.precoOriginal ?? null;
  const discount = getDiscountPercentage(price, originalPrice);
  const stock = product.estoque ?? 0;
  const { adicionarItem, isAdding } = useCart();
  const adding = isAdding(product.id);

  return (
    <>
      {/* Text content */}
      <div className="relative order-2 flex flex-col justify-center px-6 pb-8 pt-5 text-white sm:px-10 md:hidden">
        <p className="text-sm font-semibold tracking-wide text-amber-300">
          DESTAQUE SCOUT
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {product.nome}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
          {product.descricaoBreve}
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="text-2xl font-bold sm:text-3xl">
            {currencyFormatter.format(price)}
          </span>
          {originalPrice && (
            <>
              <span className="pb-1 text-sm text-slate-400 line-through">
                {currencyFormatter.format(originalPrice)}
              </span>
              <span className="mb-1 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-slate-950">
                -{discount ?? 0}%
              </span>
            </>
          )}
        </div>

        <div className="mt-7 flex items-center gap-3">
          <Link
            to={`/produtos/${product.id}`}
            className={cn(
              "rounded-lg px-5 py-3 text-sm font-bold transition",
              stock > 0
                ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                : "bg-slate-200 text-slate-500 hover:bg-slate-300",
            )}
          >
            {stock > 0 ? "Ver produto" : "Ver produto (indisponível)"}
          </Link>
          <IconButton
            aria-label={`Adicionar ${product.nome} ao carrinho`}
            disabled={stock === 0 || adding}
            onClick={() => adicionarItem(product.id)}
            className="bg-slate-200 p-3 text-slate-950 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            title={
              stock === 0
                ? "Produto indisponível"
                : adding
                  ? "Adicionando..."
                  : "Adicionar ao carrinho"
            }
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {/* Cover image */}
      <Link
        to={`/produtos/${product.id}`}
        aria-label={`Ver detalhes de ${product.nome}`}
        className="relative order-1 block h-62 overflow-hidden md:hidden"
      >
        <img
          src={getAssetUrl(product.imagemPrincipal) ?? undefined}
          alt={product.nome}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 to-transparent" />
      </Link>
    </>
  );
}
