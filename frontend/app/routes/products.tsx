import { useState } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/products";
import ProductCard from "~/components/home/ProductCard";
import { ProductBreadcrumb } from "~/components/products/ProductBreadcrumb";
import { ProductFilters } from "~/components/products/ProductFilters";
import { ProductMobileFilters } from "~/components/products/ProductMobileFilters";
import { ProductSearchBar } from "~/components/products/ProductSearchBar";
import Container from "~/components/ui/Container";
import {
  getCategory,
  mapCategoriesToMetadata,
  useCategoriesQuery,
  useProductsQuery,
} from "~/services/products";

export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Produtos | Scout Store" },
    {
      name: "description",
      content: "Explore todos os produtos da Scout Store",
    },
  ];
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], error, isLoading } = useProductsQuery();
  const categoriesQuery = useCategoriesQuery();

  const categoryFilter = searchParams.get("categoria");
  const availableOnly = searchParams.get("disponivel") === "true";
  const sortBy = (searchParams.get("ordenar") as SortOption) || "name-asc";
  const categories = mapCategoriesToMetadata(categoriesQuery.data ?? []);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput("");
  };

  const filteredProducts = products.filter((product) => {
    const productName = product.name ?? product.nome ?? "";
    const productCategoryId = product.categoryId ?? product.categoriaId ?? product.category?.id ?? product.categoria?.id;
    const matchesCategory =
      !categoryFilter ||
      productCategoryId === getCategory(categoryFilter, categories)?.id ||
      product.category?.name === getCategory(categoryFilter, categories)?.name ||
      product.categoria?.nome === getCategory(categoryFilter, categories)?.nome;
    const matchesAvailable = !availableOnly || (product.stock ?? product.estoque ?? 0) > 0;
    const matchesSearch =
      !searchInput ||
      productName.toLowerCase().includes(searchInput.toLowerCase());
    return matchesCategory && matchesAvailable && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const nameA = a.name ?? a.nome ?? "";
    const nameB = b.name ?? b.nome ?? "";
    const priceA = a.price ?? a.preco ?? 0;
    const priceB = b.price ?? b.preco ?? 0;

    switch (sortBy) {
      case "name-asc":
        return nameA.localeCompare(nameB);
      case "name-desc":
        return nameB.localeCompare(nameA);
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      default:
        return 0;
    }
  });

  const currentCategory = categoryFilter
    ? getCategory(categoryFilter, categories)
    : null;
  const hasActiveFilters = categoryFilter || availableOnly || searchInput;

  if (isLoading || categoriesQuery.isLoading) return <Container className="py-14 text-center">Carregando...</Container>;
  if (error || categoriesQuery.error) return <Container className="py-14 text-center text-red-500">Erro: {error?.message ?? categoriesQuery.error?.message ?? "Erro ao carregar dados."}</Container>;

  return (
    <main className="bg-slate-50 py-8 sm:py-10 lg:py-14">
      <Container>
        <ProductBreadcrumb currentCategory={currentCategory} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {currentCategory?.name ?? "Todos os Produtos"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {sortedProducts.length} produto
            {sortedProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:items-center md:justify-between md:flex-row">
          <ProductSearchBar
            searchInput={searchInput}
            sortBy={sortBy}
            onSearchChange={setSearchInput}
            onSortChange={(value) => updateFilters({ ordenar: value })}
          />

          <div className="flex items-center gap-2 md:shrink-0 w-full md:w-auto">
            <ProductFilters
              showFilters={showFilters}
              categoryFilter={categoryFilter}
              availableOnly={availableOnly}
              hasActiveFilters={!!hasActiveFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              categories={categories}
              onUpdateFilters={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        <ProductMobileFilters
          showFilters={showFilters}
          categoryFilter={categoryFilter}
          availableOnly={availableOnly}
          categories={categories}
          onUpdateFilters={updateFilters}
        />

        {sortedProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Nenhum produto encontrado.</p>
        )}
      </Container>
    </main>
  );
}
