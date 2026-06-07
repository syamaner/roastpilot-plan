import { Coffee, Flame } from "lucide-react";

interface RoastHistoryEmptyProps {
  onStartRoast: () => void;
}

export function RoastHistoryEmpty({ onStartRoast }: RoastHistoryEmptyProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Coffee size={64} className="text-zinc-600" />
          <Flame size={32} className="absolute -bottom-2 -right-2 text-[--color-roast-heat]" />
        </div>
      </div>

      <h3 className="text-xl font-mono text-white mb-2">No roasts yet</h3>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto">
        Your roast history will appear here once you complete your first roast.
        Start roasting to build your profile library.
      </p>

      <button
        onClick={onStartRoast}
        className="px-6 py-3 bg-[--color-roast-nominal] hover:bg-[--color-roast-nominal]/80 rounded-lg transition-colors text-black font-mono uppercase text-sm"
      >
        Start Your First Roast
      </button>
    </div>
  );
}
