import { AlertOctagon, CheckCircle, Flame, Wind } from "lucide-react";

interface FaultEvent {
  timestamp: string;
  action: string;
  detail: string;
}

interface FaultBannerProps {
  faultType: string;
  description: string;
  events: FaultEvent[];
  currentBeanTemp: number;
  currentHeat: number;
  currentFan: number;
  onAcknowledge: () => void;
}

export function FaultBanner({
  faultType,
  description,
  events,
  currentBeanTemp,
  currentHeat,
  currentFan,
  onAcknowledge,
}: FaultBannerProps) {
  return (
    <div className="relative w-full bg-[--color-roast-fault] border-b-4 border-red-600">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <AlertOctagon size={40} className="text-white flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-mono uppercase tracking-wide text-white font-bold">
                FAULT: {faultType}
              </h2>
              <p className="text-base text-white/90 mt-1">
                {description}
              </p>
            </div>
          </div>

          <button
            onClick={onAcknowledge}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-mono uppercase tracking-wide rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <CheckCircle size={20} />
            Acknowledge Fault
          </button>
        </div>

        {/* Current State and Event Trail in Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Current Safety State */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/20">
            <h3 className="text-xs uppercase tracking-wide text-white/80 mb-3">
              Current Safety State
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="text-sm text-white">Bean Temp</span>
                </div>
                <span className="font-mono text-lg text-white font-bold">{currentBeanTemp} °C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-white" />
                  <span className="text-sm text-white">Heat</span>
                </div>
                <span className="font-mono text-lg text-white font-bold">{currentHeat}% (FORCED)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind size={16} className="text-white" />
                  <span className="text-sm text-white">Fan</span>
                </div>
                <span className="font-mono text-lg text-white font-bold">{currentFan}% (SAFE)</span>
              </div>
            </div>
          </div>

          {/* Event Trail */}
          <div className="col-span-2 bg-black/30 rounded-lg p-4 border border-white/20">
            <h3 className="text-xs uppercase tracking-wide text-white/80 mb-3">
              Safety System Event Trail
            </h3>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="font-mono text-white/60 text-xs flex-shrink-0 w-16">
                    {event.timestamp}
                  </span>
                  <div className="flex-1">
                    <div className="text-white font-mono">{event.action}</div>
                    <div className="text-white/70 text-xs">{event.detail}</div>
                  </div>
                  <CheckCircle size={14} className="text-white flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-4 bg-black/40 border border-white/20 rounded-lg p-3">
          <p className="text-sm text-white leading-relaxed">
            <strong className="font-mono">System is in safe state.</strong> Heat output has been forced to 0% and fan is held at cooling level.
            Control authority remains locked until fault is acknowledged. Review the event trail above to understand what actions
            the safety layer took and when.
          </p>
        </div>
      </div>

      {/* Annotation */}
      <div className="absolute -top-3 left-6 px-3 py-1 bg-white text-black text-xs font-mono rounded">
        FULL-WIDTH FAULT BANNER — Dashboard visible below
      </div>
    </div>
  );
}
