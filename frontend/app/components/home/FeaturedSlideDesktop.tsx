import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "~/components/CartContext";
import IconButton from "~/components/ui/IconButton";
import { cn } from "~/lib/cn";
import { currencyFormatter, getDiscountPercentage } from "~/lib/formatters";
import { getAssetUrl } from "~/services/api";
import type { Product } from "~/services/products";

interface FeaturedSlideDesktopProps {
  product: Product;
}

export function FeaturedSlideDesktop({ product }: FeaturedSlideDesktopProps) {
  const price = product.preco ?? 0;
  const originalPrice = product.precoOriginal ?? null;
  const discount = getDiscountPercentage(price, originalPrice);
  const stock = product.estoque ?? 0;
  const { adicionarItem, isAdding } = useCart();
  const adding = isAdding(product.id);

  return (
    <>
      {/* Ambient background image */}
      <div className="hidden md:absolute md:inset-0 md:block">
        <img
          src={getAssetUrl(product.imagemPrincipal) ?? undefined}
          alt=""
          className="h-full w-full object-cover scale-110 opacity-70 saturate-110"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-slate-950/60" />
      </div>

      {/* Card with text and product image */}
      <div className="hidden md:relative md:z-10 md:flex md:items-center md:justify-between md:w-full md:px-12 lg:px-16">
        {/* Text content */}
        <div className="md:max-w-xl lg:max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-amber-300">
            DESTAQUE SCOUT
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-5xl xl:text-6xl text-white">
            {product.nome}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 lg:text-lg lg:leading-7">
            {product.descricaoBreve}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-2xl font-bold lg:text-3xl text-white">
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

        {/* Product image card */}
        <div className="hidden md:block md:shrink-0">
          <Link
            to={`/produtos/${product.id}`}
            aria-label={`Ver detalhes de ${product.nome}`}
            className="block rounded-2xl border border-white/10 bg-slate-900/75 p-4 shadow-2xl transition hover:shadow-amber-500/20 lg:p-5"
          >
            <img
              src={getAssetUrl(product.imagemPrincipal) ?? undefined}
              alt={product.nome}
              className="h-80 w-80 rounded-xl object-cover lg:h-100 lg:w-100"
            />
          </Link>
        </div>
      </div>
    </>
  );
}
