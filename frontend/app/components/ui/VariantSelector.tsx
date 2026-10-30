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
  productAvailable?: boolean;
};

export default function VariantSelector({
  variants,
  selectedId,
  onSelect,
  label = "Cor",
  productAvailable = true,
}: VariantSelectorProps) {
  return (
    <div className="border-y border-slate-200 py-6">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isEnabled = variant.available && productAvailable;
          return (
          <button
            key={variant.id}
            type="button"
            disabled={!isEnabled}
            onClick={() => onSelect(variant.id)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-sm font-medium transition",
              !isEnabled && "cursor-not-allowed border-transparent bg-slate-200 text-slate-500",
              isEnabled &&
                (selectedId === variant.id
                  ? "cursor-pointer border-slate-950 bg-slate-950 text-white"
                  : "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-500"),
            )}
          >
            {variant.label}
          </button>
        )})}
      </div>
    </div>
  );
}
