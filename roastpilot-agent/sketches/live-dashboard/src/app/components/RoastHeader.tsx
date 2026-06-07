import { Activity, Wifi } from "lucide-react";

interface RoastHeaderProps {
  phase: string;
  roastTime: string;
  developmentTime: string;
  developmentPercent: number;
  profileName: string;
  connectionStatus: "connected" | "disconnected";
}

export function RoastHeader({
  phase,
  roastTime,
  developmentTime,
  developmentPercent,
  profileName,
  connectionStatus,
}: RoastHeaderProps) {
  const phaseStyles: Record<string, { bg: string; text: string }> = {
    Preheating: { bg: "#94a3b8", text: "#0f0f12" },
    Roasting: { bg: "#fbbf24", text: "#0f0f12" },
    Development: { bg: "#fb923c", text: "#0f0f12" },
    Cooling: { bg: "#22d3ee", text: "#0f0f12" },
  };

  const currentPhaseStyle = phaseStyles[phase] || { bg: "#2a2a30", text: "#ffffff" };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-6">
        <div
          className="px-4 py-2 rounded-md"
          style={{ backgroundColor: currentPhaseStyle.bg }}
        >
          <span
            className="font-mono uppercase tracking-wide font-semibold"
            style={{ color: currentPhaseStyle.text }}
          >
            {phase}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-zinc-400">Roast Time</div>
            <div className="font-mono text-2xl tabular-nums text-white">{roastTime}</div>
          </div>

          {phase === "Development" && (
            <>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-xs text-zinc-400">Development</div>
                <div className="font-mono text-2xl tabular-nums text-white">{developmentTime}</div>
              </div>

              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-xs text-zinc-400">Dev %</div>
                <div className="font-mono text-2xl tabular-nums text-white">{developmentPercent}%</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <div className="text-xs text-zinc-400">Profile</div>
          <div className="font-mono text-white">{profileName}</div>
        </div>

        <div className="flex items-center gap-2">
          <Wifi
            className={
              connectionStatus === "connected"
                ? "text-[--color-roast-nominal]"
                : "text-[--color-roast-fault]"
            }
            size={16}
          />
          <Activity className="text-[--color-roast-nominal]" size={16} />
        </div>
      </div>
    </header>
  );
}
