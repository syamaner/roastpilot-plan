import { Search, Filter } from "lucide-react";

interface RoastHistoryFilterProps {
  onOriginChange: (origin: string) => void;
  onOutcomeChange: (outcome: string) => void;
  onRatingChange: (rating: string) => void;
  onSearchChange: (search: string) => void;
}

export function RoastHistoryFilter({
  onOriginChange,
  onOutcomeChange,
  onRatingChange,
  onSearchChange,
}: RoastHistoryFilterProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Filter size={18} />
          <span className="text-sm font-mono uppercase">Filters</span>
        </div>

        <div className="flex-1 flex gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search beans or profiles..."
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[--color-roast-nominal]"
            />
          </div>

          {/* Bean Origin */}
          <select
            onChange={(e) => onOriginChange(e.target.value)}
            className="bg-background border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[--color-roast-nominal]"
          >
            <option value="">All Origins</option>
            <option value="Ethiopian">Ethiopian</option>
            <option value="Colombian">Colombian</option>
            <option value="Brazilian">Brazilian</option>
            <option value="Kenyan">Kenyan</option>
            <option value="Guatemalan">Guatemalan</option>
          </select>

          {/* Outcome */}
          <select
            onChange={(e) => onOutcomeChange(e.target.value)}
            className="bg-background border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[--color-roast-nominal]"
          >
            <option value="">All Outcomes</option>
            <option value="COMPLETED">Completed</option>
            <option value="ABORTED">Aborted</option>
            <option value="FAULT">Fault</option>
          </select>

          {/* Rating */}
          <select
            onChange={(e) => onRatingChange(e.target.value)}
            className="bg-background border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[--color-roast-nominal]"
          >
            <option value="">All Ratings</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆ and up</option>
            <option value="3">★★★☆☆ and up</option>
            <option value="2">★★☆☆☆ and up</option>
            <option value="1">★☆☆☆☆ and up</option>
          </select>
        </div>
      </div>
    </div>
  );
}
