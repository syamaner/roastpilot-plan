import { Play, Zap, Download, Snowflake, CheckCircle, Sparkles } from "lucide-react";

interface TimelineEvent {
  time: string;
  label: string;
  icon: "start" | "crack" | "drop" | "cooling" | "complete";
  detail?: string;
  confidence?: number;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const iconMap = {
    start: Play,
    crack: Zap,
    drop: Download,
    cooling: Snowflake,
    complete: CheckCircle,
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-4">Event Timeline</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {/* Events */}
        <div className="space-y-4">
          {events.map((event, i) => {
            const Icon = iconMap[event.icon];
            return (
              <div key={i} className="relative flex items-start gap-4 pl-0">
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 border-border">
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-white">{event.time}</span>
                    <span className="text-white font-semibold">{event.label}</span>
                    {event.confidence && (
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Sparkles size={12} className="text-[--color-roast-fan]" />
                        <span className="font-mono">confidence {event.confidence}</span>
                      </div>
                    )}
                  </div>
                  {event.detail && (
                    <div className="text-sm text-zinc-400 mt-1">{event.detail}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
