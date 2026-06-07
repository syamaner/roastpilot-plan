import { AlertOctagon, Download, Zap, Pause, Snowflake } from "lucide-react";

interface ActionBarProps {
  onEmergencyStop: () => void;
  onDropBeans: () => void;
  onMarkFirstCrack: () => void;
  onPauseAdvisor: () => void;
  onStopCooling: () => void;
  coolingEnabled: boolean;
}

export function ActionBar({
  onEmergencyStop,
  onDropBeans,
  onMarkFirstCrack,
  onPauseAdvisor,
  onStopCooling,
  coolingEnabled,
}: ActionBarProps) {
  return (
    <div className="bg-card border-t border-border px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onEmergencyStop}
          className="flex items-center gap-2 px-6 py-3 bg-[--color-roast-fault] hover:bg-[--color-roast-fault]/80 rounded-lg transition-colors text-white"
        >
          <AlertOctagon size={20} />
          <span className="font-mono uppercase tracking-wide">Emergency Stop</span>
        </button>

        <div className="w-px h-10 bg-border" />

        <button
          onClick={onDropBeans}
          className="flex items-center gap-2 px-4 py-3 bg-[--color-roast-caution] hover:bg-[--color-roast-caution]/80 rounded-lg transition-colors text-black"
        >
          <Download size={18} />
          <span className="font-mono uppercase tracking-wide text-sm">Drop Beans</span>
        </button>

        <button
          onClick={onMarkFirstCrack}
          className="flex items-center gap-2 px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg transition-colors text-white"
        >
          <Zap size={18} />
          <span className="font-mono uppercase tracking-wide text-sm">Mark First Crack</span>
        </button>

        <button
          onClick={onPauseAdvisor}
          className="flex items-center gap-2 px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg transition-colors text-white"
        >
          <Pause size={18} />
          <span className="font-mono uppercase tracking-wide text-sm">Pause Advisor</span>
        </button>

        <button
          onClick={onStopCooling}
          disabled={!coolingEnabled}
          className="flex items-center gap-2 px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white"
        >
          <Snowflake size={18} />
          <span className="font-mono uppercase tracking-wide text-sm">Stop Cooling</span>
        </button>
      </div>
    </div>
  );
}
