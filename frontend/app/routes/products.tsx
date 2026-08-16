import { useState } from "react";
import { useSearchParams } from "react-router";
import ProductCard from "~/components/home/ProductCard";
import { ProductBreadcrumb } from "~/components/products/ProductBreadcrumb";
import { ProductFilters } from "~/components/products/ProductFilters";
import { ProductMobileFilters } from "~/components/products/ProductMobileFilters";
import { ProductSearchBar } from "~/components/products/ProductSearchBar";
import Container from "~/components/ui/Container";
import storeData from "~/data/store.mock.json";

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

  const categoryFilter = searchParams.get("categoria");
  const availableOnly = searchParams.get("disponivel") === "true";
  const sortBy = (searchParams.get("ordenar") as SortOption) || "name-asc";

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

  const filteredProducts = storeData.products.filter((product) => {
    const matchesCategory =
      !categoryFilter ||
      product.categoryId ===
        storeData.categories.find((c) => c.slug === categoryFilter)?.id;
    const matchesAvailable = !availableOnly || product.stock > 0;
    const matchesSearch =
      !searchInput ||
      product.name.toLowerCase().includes(searchInput.toLowerCase());
    return matchesCategory && matchesAvailable && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const currentCategory = categoryFilter
    ? storeData.categories.find((c) => c.slug === categoryFilter)
    : null;
  const hasActiveFilters = categoryFilter || availableOnly || searchInput;

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
              onUpdateFilters={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        <ProductMobileFilters
          showFilters={showFilters}
          categoryFilter={categoryFilter}
          availableOnly={availableOnly}
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
