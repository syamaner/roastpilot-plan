import { Brain, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

interface AdvisoryDecision {
  timestamp: string;
  recommendation: string;
  confidence: number;
  rationale: string;
  verdict: "ACCEPT" | "CLAMP" | "REJECT";
}

interface AdvisoryPanelProps {
  latestDecision: AdvisoryDecision;
  history: AdvisoryDecision[];
}

export function AdvisoryPanel({ latestDecision, history }: AdvisoryPanelProps) {
  const verdictConfig = {
    ACCEPT: { icon: CheckCircle, color: "text-[--color-roast-nominal]", bg: "bg-[--color-roast-nominal]/10" },
    CLAMP: { icon: AlertTriangle, color: "text-[--color-roast-caution]", bg: "bg-[--color-roast-caution]/10" },
    REJECT: { icon: XCircle, color: "text-[--color-roast-fault]", bg: "bg-[--color-roast-fault]/10" },
  };

  const VerdictIcon = verdictConfig[latestDecision.verdict].icon;

  return (
    <div className="bg-card rounded-lg border border-border p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <Brain size={20} className="text-[--color-roast-fan]" />
        <h3 className="text-sm uppercase tracking-wide font-mono text-white">LLM Advisory</h3>
      </div>

      <div className={`rounded-lg p-4 mb-4 ${verdictConfig[latestDecision.verdict].bg} border border-border`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-zinc-400 mb-1">Latest Recommendation</div>
            <div className="font-mono text-white">{latestDecision.recommendation}</div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${verdictConfig[latestDecision.verdict].bg}`}>
            <VerdictIcon size={16} className={verdictConfig[latestDecision.verdict].color} />
            <span className={`text-xs font-mono ${verdictConfig[latestDecision.verdict].color}`}>
              {latestDecision.verdict}
            </span>
          </div>
        </div>

        <div className="text-sm text-zinc-300 mb-3">{latestDecision.rationale}</div>

        <div className="flex items-center gap-4 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Confidence:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1 rounded-full ${
                    i < Math.round(latestDecision.confidence * 5)
                      ? "bg-[--color-roast-nominal]"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="font-mono">{Math.round(latestDecision.confidence * 100)}%</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={12} />
            <span className="font-mono">{latestDecision.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Decision History</div>
        <div className="space-y-2 overflow-y-auto max-h-48">
          {history.map((decision, i) => {
            const HistIcon = verdictConfig[decision.verdict].icon;
            return (
              <div key={i} className="flex items-center gap-3 text-sm p-2 rounded bg-background border border-border">
                <HistIcon size={14} className={verdictConfig[decision.verdict].color} />
                <span className="font-mono text-xs text-zinc-400">{decision.timestamp}</span>
                <span className="flex-1 text-xs truncate text-white">{decision.recommendation}</span>
                <span className={`text-xs font-mono ${verdictConfig[decision.verdict].color}`}>
                  {decision.verdict}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
