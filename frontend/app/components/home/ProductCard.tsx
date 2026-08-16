import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import storeData from "~/data/store.mock.json";
import IconButton from "~/components/ui/IconButton";
import { currencyFormatter, getDiscountPercentage } from "~/lib/formatters";

type Product = (typeof storeData.products)[number];

export default function ProductCard({ product }: { product: Product }) {
  const discount = getDiscountPercentage(product.price, product.originalPrice);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.coverImage}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-bold text-slate-950">
            -{discount}%
          </span>
        )}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          <div className="group/btn relative">
            <IconButton
              aria-label={`Adicionar ${product.name} ao carrinho`}
              disabled={product.stock === 0}
              className="bg-white/90 text-slate-950 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              title={
                product.stock > 0
                  ? "Adicionar ao carrinho"
                  : "Produto indisponível"
              }
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            {product.stock === 0 && (
              <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                Esgotado
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 md:p-5">
        <h3 className="font-semibold text-slate-950 md:text-lg">
          {product.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold text-slate-950">
            {currencyFormatter.format(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              {currencyFormatter.format(product.originalPrice)}
            </span>
          )}
        </div>
        <Link
          to={`/produtos/${product.slug}`}
          className="mt-4 block w-full rounded-lg bg-amber-300 px-3 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-200"
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
}
