import { Calendar, Clock, TrendingUp, Zap } from "lucide-react";

interface RoastDetailHeaderProps {
  roastName: string;
  date: string;
  outcome: "COMPLETED" | "ABORTED" | "FAULT";
  totalTime: string;
  firstCrackTime: string;
  firstCrackTemp: number;
  dropTime: string;
  dropTemp: number;
  developmentPercent: number;
}

export function RoastDetailHeader({
  roastName,
  date,
  outcome,
  totalTime,
  firstCrackTime,
  firstCrackTemp,
  dropTime,
  dropTemp,
  developmentPercent,
}: RoastDetailHeaderProps) {
  const outcomeStyles = {
    COMPLETED: { bg: "#34d399", text: "#0f0f12" },
    ABORTED: { bg: "#fbbf24", text: "#0f0f12" },
    FAULT: { bg: "#f87171", text: "#ffffff" },
  };

  const style = outcomeStyles[outcome];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-mono text-white mb-2">{roastName}</h1>
          <div className="flex items-center gap-4 text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="text-sm">{date}</span>
            </div>
          </div>
        </div>
        <div
          className="px-4 py-2 rounded-md font-mono uppercase tracking-wide font-semibold"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {outcome}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6 pt-4 border-t border-border">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase mb-2">
            <Clock size={14} />
            <span>Total Time</span>
          </div>
          <div className="font-mono text-2xl text-white">{totalTime}</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase mb-2">
            <Zap size={14} />
            <span>First Crack</span>
          </div>
          <div className="font-mono text-xl text-white">{firstCrackTime}</div>
          <div className="font-mono text-sm text-[--color-roast-caution]">{firstCrackTemp} °C</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase mb-2">
            <TrendingUp size={14} />
            <span>Drop</span>
          </div>
          <div className="font-mono text-xl text-white">{dropTime}</div>
          <div className="font-mono text-sm text-[--color-roast-fault]">{dropTemp} °C</div>
        </div>

        <div>
          <div className="text-zinc-400 text-xs uppercase mb-2">Development</div>
          <div className="font-mono text-2xl text-white">{developmentPercent}%</div>
        </div>

        <div>
          <div className="text-zinc-400 text-xs uppercase mb-2">Development Time</div>
          <div className="font-mono text-2xl text-white">
            {calculateDevTime(firstCrackTime, dropTime)}
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateDevTime(firstCrack: string, drop: string): string {
  const [fc_min, fc_sec] = firstCrack.split(":").map(Number);
  const [d_min, d_sec] = drop.split(":").map(Number);
  const fc_total = fc_min * 60 + fc_sec;
  const d_total = d_min * 60 + d_sec;
  const diff = d_total - fc_total;
  const min = Math.floor(diff / 60);
  const sec = diff % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
