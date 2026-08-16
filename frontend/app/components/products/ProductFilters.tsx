import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef } from "react";
import storeData from "~/data/store.mock.json";

interface ProductFiltersProps {
  showFilters: boolean;
  categoryFilter: string | null;
  availableOnly: boolean;
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
  onUpdateFilters: (updates: Record<string, string | null>) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  showFilters,
  categoryFilter,
  availableOnly,
  hasActiveFilters,
  onToggleFilters,
  onUpdateFilters,
  onClearFilters,
}: ProductFiltersProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isButton = buttonRef.current && buttonRef.current.contains(target);
      const isDropdown =
        dropdownRef.current && dropdownRef.current.contains(target);

      if (!isButton && !isDropdown) {
        onToggleFilters();
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters, onToggleFilters]);
  return (
    <div className="relative flex-1 md:flex-none">
      <button
        ref={buttonRef}
        onClick={onToggleFilters}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition cursor-pointer md:w-auto ${showFilters ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filtros
      </button>

      {/* Desktop Filters */}
      <div
        ref={dropdownRef}
        className={`absolute right-0 top-full z-10 mt-2 hidden w-72 origin-top overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-lg transition-all duration-300 ease-out md:block ${showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
      >
        <div className="grid gap-5">
          <div>
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-slate-950"
            >
              Categoria
            </label>
            <select
              id="category-filter"
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
              <span className="text-sm text-slate-600">Apenas disponíveis</span>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Mobile Clear Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-amber-700 hover:text-amber-800 md:hidden"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Limpar
        </button>
      )}
    </div>
  );
}
