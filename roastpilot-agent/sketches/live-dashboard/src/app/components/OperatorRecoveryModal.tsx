import { AlertTriangle, PlayCircle, Download, Snowflake, AlertOctagon, Clock } from "lucide-react";

interface RecoveryState {
  lastKnownPhase: string;
  lastKnownTime: string;
  lastBeanTemp: number;
  lastHeat: number;
  lastFan: number;
  currentBeanTemp: number;
  currentEnvTemp: number;
  restartedAt: string;
}

interface OperatorRecoveryModalProps {
  state: RecoveryState;
  onResumeMonitoring: () => void;
  onDropBeans: () => void;
  onStartCooling: () => void;
  onEmergencyStop: () => void;
}

export function OperatorRecoveryModal({
  state,
  onResumeMonitoring,
  onDropBeans,
  onStartCooling,
  onEmergencyStop,
}: OperatorRecoveryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-card border-2 border-[--color-roast-caution] rounded-lg shadow-2xl max-w-3xl w-full mx-6">
        {/* Header */}
        <div className="bg-[--color-roast-caution]/20 border-b-2 border-[--color-roast-caution] px-6 py-4">
          <div className="flex items-center gap-4">
            <AlertTriangle size={32} className="text-[--color-roast-caution]" />
            <div>
              <h2 className="text-xl font-mono uppercase tracking-wide text-white">
                Operator Recovery Required
              </h2>
              <p className="text-sm text-zinc-300 mt-1">
                System restarted during active roast — manual intervention needed
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Last Known State */}
          <div className="bg-background border border-border rounded-lg p-4">
            <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-3 flex items-center gap-2">
              <Clock size={16} />
              Last Known State (Before Restart)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Phase</div>
                <div className="font-mono text-lg text-white">{state.lastKnownPhase}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Roast Time</div>
                <div className="font-mono text-lg text-white">{state.lastKnownTime}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Bean Temperature</div>
                <div className="font-mono text-lg text-[--color-roast-caution]">{state.lastBeanTemp} °C</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Heat Setting</div>
                <div className="font-mono text-lg text-[--color-roast-heat]">{state.lastHeat}%</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Fan Setting</div>
                <div className="font-mono text-lg text-[--color-roast-fan]">{state.lastFan}%</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Restarted At</div>
                <div className="font-mono text-lg text-zinc-300">{state.restartedAt}</div>
              </div>
            </div>
          </div>

          {/* Current Hardware Readout */}
          <div className="bg-background border border-border rounded-lg p-4">
            <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-3">
              Current Hardware Readout
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Bean Temperature (Now)</div>
                <div className="font-mono text-2xl text-white">{state.currentBeanTemp} °C</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Environment Temperature</div>
                <div className="font-mono text-2xl text-white">{state.currentEnvTemp} °C</div>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-[--color-roast-caution]/10 border border-[--color-roast-caution] rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="text-[--color-roast-caution] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-sm text-white mb-1">System Awaiting Operator Decision</div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Heat and fan control are <strong className="text-white">locked at safe defaults</strong>.
                  The system will not make any adjustments until you explicitly choose an action below.
                  Dashboard telemetry continues to update in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">
              Select Recovery Action
            </div>

            <button
              onClick={onResumeMonitoring}
              className="w-full flex items-center justify-between px-6 py-4 bg-[--color-roast-nominal] hover:bg-[--color-roast-nominal]/80 rounded-lg transition-colors text-black group"
            >
              <div className="flex items-center gap-3">
                <PlayCircle size={24} />
                <div className="text-left">
                  <div className="font-mono uppercase tracking-wide font-semibold">Resume Monitoring Only</div>
                  <div className="text-xs opacity-80 mt-0.5">Continue roast, resume LLM advisor, restore control loop</div>
                </div>
              </div>
              <div className="text-xs opacity-60 group-hover:opacity-100">Recommended if roast is salvageable</div>
            </button>

            <button
              onClick={onDropBeans}
              className="w-full flex items-center justify-between px-6 py-4 bg-card hover:bg-muted border-2 border-border rounded-lg transition-colors text-white group"
            >
              <div className="flex items-center gap-3">
                <Download size={24} />
                <div className="text-left">
                  <div className="font-mono uppercase tracking-wide font-semibold">Drop Beans Now</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Eject beans into cooling tray, end roast</div>
                </div>
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-white">Safe early termination</div>
            </button>

            <button
              onClick={onStartCooling}
              className="w-full flex items-center justify-between px-6 py-4 bg-card hover:bg-muted border-2 border-border rounded-lg transition-colors text-white group"
            >
              <div className="flex items-center gap-3">
                <Snowflake size={24} />
                <div className="text-left">
                  <div className="font-mono uppercase tracking-wide font-semibold">Start Cooling</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Cut heat, max fan, begin cooldown (beans still in drum)</div>
                </div>
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-white">Use if beans overdeveloped</div>
            </button>

            <button
              onClick={onEmergencyStop}
              className="w-full flex items-center justify-between px-6 py-4 bg-[--color-roast-fault] hover:bg-[--color-roast-fault]/80 rounded-lg transition-colors text-white group"
            >
              <div className="flex items-center gap-3">
                <AlertOctagon size={24} />
                <div className="text-left">
                  <div className="font-mono uppercase tracking-wide font-semibold">Emergency Stop</div>
                  <div className="text-xs opacity-80 mt-0.5">Halt all systems immediately</div>
                </div>
              </div>
              <div className="text-xs opacity-60 group-hover:opacity-100">Use only if unsafe to continue</div>
            </button>
          </div>
        </div>

        {/* Annotation */}
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-[--color-roast-caution] text-black text-xs font-mono rounded">
          BLOCKING MODAL — Dashboard updates beneath
        </div>
      </div>
    </div>
  );
}
