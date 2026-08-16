import { cn } from "~/lib/cn";

type Variant = {
  id: string;
  label: string;
  available: boolean;
};

type VariantSelectorProps = {
  variants: Variant[];
  selectedId: string;
  onSelect: (id: string) => void;
  label?: string;
};

export default function VariantSelector({
  variants,
  selectedId,
  onSelect,
  label = "Cor",
}: VariantSelectorProps) {
  return (
    <div className="border-y border-slate-200 py-6">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            disabled={!variant.available}
            onClick={() => onSelect(variant.id)}
            className={cn(
              "cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition",
              selectedId === variant.id
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500",
              !variant.available &&
                "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400",
            )}
          >
            {variant.label}
          </button>
        ))}
      </div>
    </div>
  );
}
