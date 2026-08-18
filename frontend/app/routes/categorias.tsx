import { ArrowRight, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/categorias";
import ProductCard from "~/components/home/ProductCard";
import Container from "~/components/ui/Container";
import storeData from "~/data/store.mock.json";

const featuredCategories = [...storeData.categories]
  .map((category) => ({
    ...category,
    productCount: storeData.products.filter(
      (product) => product.categoryId === category.id,
    ).length,
  }))
  .sort((a, b) => b.productCount - a.productCount)
  .slice(0, 3);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Categorias | Scout Store" },
    {
      name: "description",
      content:
        "Explore as categorias da Scout Store e veja os produtos em destaque.",
    },
  ];
}

export default function CategoriesPage() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategoryLinks = showAllCategories
    ? storeData.categories
    : storeData.categories.slice(0, 3);
  const hasMoreCategories =
    storeData.categories.length > visibleCategoryLinks.length;

  return (
    <main className="bg-slate-50 py-8 sm:py-10 lg:py-14">
      <Container>
        <div className="mb-8 sm:mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-600 uppercase">
            Navegue por assunto
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Categorias
          </h1>
        </div>

        <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Todas as categorias
            </h2>

            {hasMoreCategories && (
              <button
                type="button"
                onClick={() => setShowAllCategories((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-slate-950"
              >
                {showAllCategories ? "Ver menos" : "Ver mais"}
                {showAllCategories ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategoryLinks.map((category) => (
              <Link
                key={category.id}
                to={`/produtos?categoria=${category.slug}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-slate-950"
              >
                <span>{category.name}</span>
                <ChevronRight
                  className="h-4 w-4 text-slate-400 transition group-hover:text-slate-950"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-10">
          {featuredCategories.map((category) => {
            const categoryProducts = storeData.products.filter(
              (product) => product.categoryId === category.id,
            );
            const visibleProducts = categoryProducts.slice(0, 4);

            return (
              <section
                key={category.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {category.name}
                  </h2>

                  <Link
                    to={`/produtos?categoria=${category.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                  >
                    Ver mais
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="hidden gap-5 sm:grid sm:grid-cols-2 xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="grid gap-5 sm:hidden">
                  {visibleProducts.slice(0, 1).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
