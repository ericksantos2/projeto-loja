import { Search } from "lucide-react";
import type { SortOption } from "~/routes/products";

interface ProductSearchBarProps {
  searchInput: string;
  sortBy: SortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
}

export function ProductSearchBar({
  searchInput,
  sortBy,
  onSearchChange,
  onSortChange,
}: ProductSearchBarProps) {
  return (
    <div className="flex flex-col gap-3 md:items-center md:justify-between md:flex-row md:flex-1">
      <div className="relative md:max-w-md md:flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Buscar produtos..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-950 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>

      <div className="flex items-center gap-2 md:shrink-0">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 md:flex-none cursor-pointer"
        >
          <option value="name-asc">Nome (A-Z)</option>
          <option value="name-desc">Nome (Z-A)</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>
    </div>
  );
}
