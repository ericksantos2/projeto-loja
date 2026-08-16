import { Check } from "lucide-react";

type HighlightsListProps = {
  highlights: string[];
};

export default function HighlightsList({ highlights }: HighlightsListProps) {
  return (
    <ul className="mt-5 space-y-3 text-slate-600">
      {highlights.map((highlight) => (
        <li key={highlight} className="flex gap-3">
          <Check
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
            aria-hidden="true"
          />
          {highlight}
        </li>
      ))}
    </ul>
  );
}
