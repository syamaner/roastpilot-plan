import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight } from "lucide-react";

interface Decision {
  id: string;
  time: string;
  recommendedHeat: number;
  recommendedFan: number;
  verdict: "ACCEPT" | "CLAMP" | "REJECT";
  executedHeat: number;
  executedFan: number;
  rationale: string;
}

interface DecisionTraceTableProps {
  decisions: Decision[];
  /** Selected row (links to the chart highlight marker). */
  selectedId?: string | null;
  onSelectRow?: (decision: Decision) => void;
}

export function DecisionTraceTable({ decisions, selectedId, onSelectRow }: DecisionTraceTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const verdictConfig = {
    ACCEPT: { icon: CheckCircle, color: "text-[--color-roast-nominal]", bg: "bg-[--color-roast-nominal]/10" },
    CLAMP: { icon: AlertTriangle, color: "text-[--color-roast-caution]", bg: "bg-[--color-roast-caution]/10" },
    REJECT: { icon: XCircle, color: "text-[--color-roast-fault]", bg: "bg-[--color-roast-fault]/10" },
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-sm uppercase tracking-wide text-white font-mono">
          LLM Decision Trace
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Complete log of advisor recommendations and safety system verdicts
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr className="text-xs uppercase text-zinc-400 font-mono">
              <th className="text-left px-6 py-3 w-8"></th>
              <th className="text-left px-6 py-3">Time</th>
              <th className="text-left px-6 py-3">Recommended</th>
              <th className="text-left px-6 py-3">Verdict</th>
              <th className="text-left px-6 py-3">Executed</th>
              <th className="text-left px-6 py-3">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision, i) => {
              const VerdictIcon = verdictConfig[decision.verdict].icon;
              const isExpanded = expandedRows.has(decision.id);
              const truncatedRationale = decision.rationale.length > 60
                ? decision.rationale.substring(0, 60) + "..."
                : decision.rationale;

              return (
                <tr
                  key={decision.id}
                  onClick={() => onSelectRow?.(decision)}
                  className={`border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                    selectedId === decision.id
                      ? "bg-muted border-l-2 border-l-white"
                      : i % 2 === 0 ? "bg-background/50" : ""
                  }`}
                >
                  <td className="px-6 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleRow(decision.id); }}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-3 font-mono text-white">{decision.time}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3 text-sm font-mono">
                      <span className="text-[--color-roast-heat]">H: {decision.recommendedHeat}%</span>
                      <span className="text-[--color-roast-fan]">F: {decision.recommendedFan}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md ${verdictConfig[decision.verdict].bg}`}>
                      <VerdictIcon size={14} className={verdictConfig[decision.verdict].color} />
                      <span className={`text-xs font-mono ${verdictConfig[decision.verdict].color}`}>
                        {decision.verdict}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3 text-sm font-mono">
                      <span className={decision.executedHeat !== decision.recommendedHeat ? "text-[--color-roast-caution]" : "text-[--color-roast-heat]"}>
                        H: {decision.executedHeat}%
                      </span>
                      <span className={decision.executedFan !== decision.recommendedFan ? "text-[--color-roast-caution]" : "text-[--color-roast-fan]"}>
                        F: {decision.executedFan}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {isExpanded ? (
                      <div className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                        {decision.rationale}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-400">
                        {truncatedRationale}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-background border-t border-border text-xs text-zinc-400 font-mono">
        {decisions.length} decisions logged • {decisions.filter(d => d.verdict === "ACCEPT").length} accepted •{" "}
        {decisions.filter(d => d.verdict === "CLAMP").length} clamped •{" "}
        {decisions.filter(d => d.verdict === "REJECT").length} rejected
      </div>
    </div>
  );
}
