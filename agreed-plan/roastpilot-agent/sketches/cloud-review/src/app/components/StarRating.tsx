import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = (hoverValue ?? value) >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            className="touch-manipulation p-2 transition-transform active:scale-95"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                isActive
                  ? "fill-amber-500 stroke-amber-600"
                  : "fill-transparent stroke-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
