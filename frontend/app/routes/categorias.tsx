import { ArrowRight, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/categorias";
import ProductCard from "~/components/home/ProductCard";
import Container from "~/components/ui/Container";
import {
  useCategoriesQuery,
  useProductsQuery,
  mapCategoriesToMetadata,
} from "~/services/products";

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

  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery();

  const isLoading = categoriesQuery.isLoading || productsQuery.isLoading;
  const error = categoriesQuery.error || productsQuery.error;

  const fetchedCategories = categoriesQuery.data || [];
  const categories = fetchedCategories.length > 0
    ? mapCategoriesToMetadata(fetchedCategories)
    : [];
  const products = productsQuery.data || [];

  const visibleCategoryLinks = showAllCategories
    ? categories
    : categories.slice(0, 3);

  if (isLoading)
    return (
      <Container className="py-14 text-center text-slate-500">
        Carregando categorias...
      </Container>
    );
  if (error)
    return (
      <Container className="py-14 text-center text-red-500">
        Erro ao carregar dados: {error.message}
      </Container>
    );

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

        {/* Todas as categorias (Links do topo) */}
        <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Todas as categorias
            </h2>
            {categories.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllCategories((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {showAllCategories ? "Ver menos" : "Ver mais"}
                {showAllCategories ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategoryLinks.map((category) => (
              <Link
                key={category.id}
                to={`/produtos?categoria=${category.id}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100 transition"
              >
                {category.name || category.nome}
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-950 transition" />
              </Link>
            ))}
          </div>
        </section>

        {/* Blocos de Produtos por Categoria */}
        <div className="space-y-10">
          {categories.map((category) => {
            const catName = (
              category.name ||
              category.nome ||
              ""
            ).toLowerCase();

            const categoryProducts = products
              .filter((product) => {
                const prodCatId =
                  product.categoryId ??
                  product.categoriaId ??
                  product.categoria?.id ??
                  product.category?.id;
                const prodCatName = (
                  product.categoria?.nome ||
                  product.category?.name ||
                  product.categoria?.name ||
                  ""
                ).toLowerCase();

                return (
                  prodCatId === category.id ||
                  (catName && prodCatName && catName === prodCatName)
                );
              })
              .slice(0, 4);

            return (
              <section
                key={category.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs"
              >
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-bold text-slate-950">
                    {category.name || category.nome}
                  </h2>
                  <Link
                    to={`/produtos?categoria=${category.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950 transition"
                  >
                    Ver mais <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {categoryProducts.length > 0 ? (
                  <>
                    <div className="hidden gap-5 sm:grid sm:grid-cols-2 xl:grid-cols-4">
                      {categoryProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                    <div className="grid gap-5 sm:hidden">
                      {categoryProducts.slice(0, 1).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">
                    Nenhum produto cadastrado nesta categoria ainda.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
