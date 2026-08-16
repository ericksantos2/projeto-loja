import storeData from "~/data/store.mock.json";

interface ProductMobileFiltersProps {
  showFilters: boolean;
  categoryFilter: string | null;
  availableOnly: boolean;
  onUpdateFilters: (updates: Record<string, string | null>) => void;
}

export function ProductMobileFilters({
  showFilters,
  categoryFilter,
  availableOnly,
  onUpdateFilters,
}: ProductMobileFiltersProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 md:hidden ${showFilters ? "max-h-96 opacity-100 translate-y-0 mb-6 p-5" : "max-h-0 opacity-0 -translate-y-4 border-transparent"}`}
    >
      <div className="grid gap-6">
        <div>
          <label
            htmlFor="category-filter-mobile"
            className="block text-sm font-medium text-slate-950"
          >
            Categoria
          </label>
          <select
            id="category-filter-mobile"
            value={categoryFilter || ""}
            onChange={(e) =>
              onUpdateFilters({ categoria: e.target.value || null })
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="">Todas as categorias</option>
            {storeData.categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-950">
            Disponibilidade
          </label>
          <label className="mt-2 flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) =>
                onUpdateFilters({
                  disponivel: e.target.checked ? "true" : null,
                })
              }
              className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-sm text-slate-600">
              Mostrar apenas produtos disponíveis
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
