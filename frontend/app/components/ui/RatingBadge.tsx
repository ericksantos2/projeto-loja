import { Star } from "lucide-react";

type RatingBadgeProps = {
  rating: number;
};

export default function RatingBadge({ rating }: RatingBadgeProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-800">
      <Star className="h-4 w-4 fill-current" aria-hidden="true" />
      {rating}
    </span>
  );
}
