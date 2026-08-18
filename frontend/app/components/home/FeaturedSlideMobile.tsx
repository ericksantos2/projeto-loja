import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import IconButton from "~/components/ui/IconButton";
import { currencyFormatter, getDiscountPercentage } from "~/lib/formatters";
import type { Product } from "~/data/store.mock.json";

interface FeaturedSlideMobileProps {
  product: Product;
}

export function FeaturedSlideMobile({ product }: FeaturedSlideMobileProps) {
  const discount = getDiscountPercentage(product.price, product.originalPrice);

  return (
    <>
      {/* Text content */}
      <div className="relative order-2 flex flex-col justify-center px-6 pb-8 pt-5 text-white sm:px-10 md:hidden">
        <p className="text-sm font-semibold tracking-wide text-amber-300">
          DESTAQUE SCOUT
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
          {product.shortDescription}
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="text-2xl font-bold sm:text-3xl">
            {currencyFormatter.format(product.price)}
          </span>
          {product.originalPrice && (
            <>
              <span className="pb-1 text-sm text-slate-400 line-through">
                {currencyFormatter.format(product.originalPrice)}
              </span>
              <span className="mb-1 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-slate-950">
                -{discount}%
              </span>
            </>
          )}
        </div>

        <div className="mt-7 flex items-center gap-3">
          <Link
            to={`/produtos/${product.slug}`}
            className="rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
          >
            Ver produto
          </Link>
          <IconButton
            aria-label={`Adicionar ${product.name} ao carrinho`}
            disabled={product.stock === 0}
            className="bg-slate-200 p-3 text-slate-950 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            title={
              product.stock > 0
                ? "Adicionar ao carrinho"
                : "Produto indisponível"
            }
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {/* Cover image */}
      <Link
        to={`/produtos/${product.slug}`}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative order-1 block h-62 overflow-hidden md:hidden"
      >
        <img
          src={product.coverImage}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 to-transparent" />
      </Link>
    </>
  );
}
