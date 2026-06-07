import { Flame, Wind } from "lucide-react";

interface ControlIndicatorProps {
  type: "heat" | "fan";
  current: number;
  target?: number;
  advisorTarget?: number;
}

export function ControlIndicator({ type, current, target, advisorTarget }: ControlIndicatorProps) {
  const config = type === "heat"
    ? {
        label: "HEAT",
        color: "var(--color-roast-heat)",
        dimColor: "var(--color-roast-heat-dim)",
        icon: Flame,
      }
    : {
        label: "FAN",
        color: "var(--color-roast-fan)",
        dimColor: "var(--color-roast-fan-dim)",
        icon: Wind,
      };

  const Icon = config.icon;

  return (
    <div className="bg-card rounded-lg border border-border p-6 flex-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon size={24} style={{ color: config.color }} />
          <span className="text-sm uppercase tracking-wide font-mono text-white">{config.label}</span>
        </div>
        <div className="font-mono text-4xl tabular-nums" style={{ color: config.color }}>
          {current}%
        </div>
      </div>

      <div className="relative h-3 bg-background rounded-full overflow-hidden">
        <div
          className="absolute h-full transition-all duration-300"
          style={{
            width: `${current}%`,
            backgroundColor: config.color,
          }}
        />

        {advisorTarget !== undefined && (
          <div
            className="absolute top-0 h-full w-1 opacity-50"
            style={{
              left: `${advisorTarget}%`,
              backgroundColor: config.color,
              boxShadow: `0 0 8px ${config.color}`,
            }}
            title={`Advisor suggests: ${advisorTarget}%`}
          />
        )}

        {target !== undefined && target !== current && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white opacity-60"
            style={{ left: `${target}%` }}
            title={`Target: ${target}%`}
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono tabular-nums">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
