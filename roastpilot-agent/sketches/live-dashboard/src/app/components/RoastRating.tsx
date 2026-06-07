import { useState } from "react";
import { Star, Save } from "lucide-react";

interface RoastRatingProps {
  onSave: (rating: number, notes: string) => void;
}

export function RoastRating({ onSave }: RoastRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    onSave(rating, notes);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-4">Rate This Roast</h3>

      <div className="flex items-center gap-3 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={
                star <= (hoverRating || rating)
                  ? "fill-[--color-roast-caution] text-[--color-roast-caution]"
                  : "text-zinc-600"
              }
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-zinc-400 ml-2">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </span>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tasting notes, observations, things to improve next time..."
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-[--color-roast-nominal]"
        rows={3}
      />

      <button
        onClick={handleSave}
        disabled={rating === 0}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-[--color-roast-nominal] hover:bg-[--color-roast-nominal]/80 disabled:bg-muted disabled:text-zinc-500 disabled:cursor-not-allowed rounded-lg transition-colors text-black font-mono uppercase text-sm"
      >
        <Save size={16} />
        Save Rating
      </button>
    </div>
  );
}
