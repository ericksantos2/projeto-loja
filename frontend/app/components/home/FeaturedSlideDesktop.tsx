import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import IconButton from "~/components/ui/IconButton";
import { currencyFormatter, getDiscountPercentage } from "~/lib/formatters";
import type { Product } from "~/data/store.mock.json";

interface FeaturedSlideDesktopProps {
  product: Product;
}

export function FeaturedSlideDesktop({ product }: FeaturedSlideDesktopProps) {
  const discount = getDiscountPercentage(product.price, product.originalPrice);

  return (
    <>
      {/* Blurred background image */}
      <div className="hidden md:absolute md:inset-0 md:block">
        <img
          src={product.coverImage}
          alt=""
          className="h-full w-full object-cover scale-110 blur-sm opacity-60"
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
            {product.name}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 lg:text-lg lg:leading-7">
            {product.shortDescription}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-2xl font-bold lg:text-3xl text-white">
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

        {/* Product image card */}
        <div className="hidden md:block md:shrink-0">
          <div className="rounded-2xl bg-slate-900/80 p-4 backdrop-blur-sm shadow-2xl lg:p-5">
            <img
              src={product.coverImage}
              alt={product.name}
              className="h-80 w-80 rounded-xl object-cover lg:h-100 lg:w-100"
            />
          </div>
        </div>
      </div>
    </>
  );
}
