import { Package } from "lucide-react";

type StockBadgeProps = {
  stock: number;
};

export default function StockBadge({ stock }: StockBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-amber-100 p-5 text-sm text-slate-700">
      <Package className="h-6 w-6 shrink-0 text-amber-700" aria-hidden="true" />
      Estoque disponível: {stock} unidade{stock === 1 ? "" : "s"}.
    </div>
  );
}
