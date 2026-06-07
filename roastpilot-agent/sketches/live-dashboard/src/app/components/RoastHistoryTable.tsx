import { Star } from "lucide-react";
import { RoastSparkline } from "./RoastSparkline";

interface RoastHistoryRow {
  id: string;
  date: string;
  bean: string;
  profile: string;
  outcome: "COMPLETED" | "ABORTED" | "FAULT";
  firstCrackTime: string;
  dropTemp: number;
  developmentPercent: number;
  rating: number;
  sparklineData: number[];
}

interface RoastHistoryTableProps {
  roasts: RoastHistoryRow[];
  onRowClick: (id: string) => void;
}

export function RoastHistoryTable({ roasts, onRowClick }: RoastHistoryTableProps) {
  const outcomeStyles = {
    COMPLETED: { bg: "bg-[--color-roast-nominal]/20", text: "text-[--color-roast-nominal]", border: "border-[--color-roast-nominal]" },
    ABORTED: { bg: "bg-[--color-roast-caution]/20", text: "text-[--color-roast-caution]", border: "border-[--color-roast-caution]" },
    FAULT: { bg: "bg-[--color-roast-fault]/20", text: "text-[--color-roast-fault]", border: "border-[--color-roast-fault]" },
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr className="text-xs uppercase text-zinc-400 font-mono">
              <th className="text-left px-6 py-3">Date</th>
              <th className="text-left px-6 py-3">Bean & Profile</th>
              <th className="text-left px-6 py-3">Outcome</th>
              <th className="text-left px-6 py-3">1st Crack</th>
              <th className="text-left px-6 py-3">Drop Temp</th>
              <th className="text-left px-6 py-3">Dev %</th>
              <th className="text-left px-6 py-3">Rating</th>
              <th className="text-left px-6 py-3">Curve</th>
            </tr>
          </thead>
          <tbody>
            {roasts.map((roast, i) => {
              const style = outcomeStyles[roast.outcome];
              return (
                <tr
                  key={roast.id}
                  onClick={() => onRowClick(roast.id)}
                  className={`border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                    i % 2 === 0 ? "bg-background/30" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-mono text-white whitespace-nowrap">
                    {roast.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-medium">{roast.bean}</div>
                    <div className="text-xs text-zinc-400">{roast.profile}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded border text-xs font-mono ${style.bg} ${style.text} ${style.border}`}>
                      {roast.outcome}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-white">
                    {roast.firstCrackTime}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-[--color-roast-fault]">
                    {roast.dropTemp}°C
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-white">
                    {roast.developmentPercent}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < roast.rating
                              ? "fill-[--color-roast-caution] text-[--color-roast-caution]"
                              : "text-zinc-600"
                          }
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoastSparkline data={roast.sparklineData} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-background border-t border-border text-xs text-zinc-400 font-mono">
        {roasts.length} roast{roasts.length !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
