import { useState } from "react";
import { RoastHistoryFilter } from "./RoastHistoryFilter";
import { RoastHistoryTable } from "./RoastHistoryTable";
import { RoastHistoryEmpty } from "./RoastHistoryEmpty";
import { Plus } from "lucide-react";

interface RoastHistoryScreenProps {
  mockRoasts: any[];
  onRowClick: (id: string) => void;
  onStartRoast: () => void;
}

export function RoastHistoryScreen({ mockRoasts, onRowClick, onStartRoast }: RoastHistoryScreenProps) {
  const [filteredRoasts, setFilteredRoasts] = useState(mockRoasts);
  const [filters, setFilters] = useState({
    search: "",
    origin: "",
    outcome: "",
    rating: "",
  });

  const applyFilters = (newFilters: typeof filters) => {
    let filtered = mockRoasts;

    if (newFilters.search) {
      filtered = filtered.filter(
        (r) =>
          r.bean.toLowerCase().includes(newFilters.search.toLowerCase()) ||
          r.profile.toLowerCase().includes(newFilters.search.toLowerCase())
      );
    }

    if (newFilters.origin) {
      filtered = filtered.filter((r) => r.bean.includes(newFilters.origin));
    }

    if (newFilters.outcome) {
      filtered = filtered.filter((r) => r.outcome === newFilters.outcome);
    }

    if (newFilters.rating) {
      const minRating = parseInt(newFilters.rating);
      filtered = filtered.filter((r) => r.rating >= minRating);
    }

    setFilteredRoasts(filtered);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  return (
    <div className="h-screen overflow-y-auto bg-background dark p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-mono text-white mb-2">Roast History</h1>
            <p className="text-zinc-400">
              Review past roasts, compare results, and refine your technique
            </p>
          </div>
          <button
            onClick={onStartRoast}
            className="flex items-center gap-2 px-6 py-3 bg-[--color-roast-nominal] hover:bg-[--color-roast-nominal]/80 rounded-lg transition-colors text-black font-mono uppercase text-sm"
          >
            <Plus size={20} />
            New Roast
          </button>
        </div>

        {mockRoasts.length === 0 ? (
          <RoastHistoryEmpty onStartRoast={onStartRoast} />
        ) : (
          <>
            <RoastHistoryFilter
              onOriginChange={(v) => handleFilterChange("origin", v)}
              onOutcomeChange={(v) => handleFilterChange("outcome", v)}
              onRatingChange={(v) => handleFilterChange("rating", v)}
              onSearchChange={(v) => handleFilterChange("search", v)}
            />

            {filteredRoasts.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-zinc-400">No roasts match your filters</p>
              </div>
            ) : (
              <RoastHistoryTable roasts={filteredRoasts} onRowClick={onRowClick} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
