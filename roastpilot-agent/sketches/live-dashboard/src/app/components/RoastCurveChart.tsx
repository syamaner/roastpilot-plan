import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ChartDataPoint {
  time: number;
  beanTemp: number;
  envTemp: number;
  ror: number;
  heat: number;
  fan: number;
}

interface EventMarker {
  time: number;
  label: string;
  color: string;
}

interface RoastCurveChartProps {
  data: ChartDataPoint[];
  events: EventMarker[];
  /** Timestamp (seconds) of a selected decision-trace row; renders a highlight marker. */
  highlightTime?: number | null;
}

function formatTime(t: number) {
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

export function RoastCurveChart({ data, events, highlightTime }: RoastCurveChartProps) {
  const [scrubberPosition, setScrubberPosition] = useState<number | null>(null);

  const handleMouseMove = (e: any) => {
    if (e && e.activeLabel !== undefined) {
      setScrubberPosition(e.activeLabel);
    }
  };

  const handleMouseLeave = () => {
    setScrubberPosition(null);
  };

  // Readout follows the hover scrubber; falls back to the selected decision time.
  const readoutTime = scrubberPosition ?? highlightTime ?? null;
  const currentData = readoutTime !== null
    ? data.find(d => d.time === readoutTime) ?? data.reduce((best, d) =>
        Math.abs(d.time - readoutTime) < Math.abs(best.time - readoutTime) ? d : best, data[0])
    : null;

  return (
    <div className="bg-card rounded-lg border border-border p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm uppercase tracking-wide text-zinc-400">Roast Curve</h3>
        {currentData ? (
          // Cursor readout: all five series at the hovered/selected time
          <div className="flex gap-3 text-xs font-mono">
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">T:</span>
              <span className="text-white">{formatTime(currentData.time)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Bean:</span>
              <span className="text-[--color-roast-caution]">{currentData.beanTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Env:</span>
              <span className="text-[--color-roast-fan]">{currentData.envTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">RoR:</span>
              <span className="text-[--color-roast-nominal]">{currentData.ror.toFixed(1)}°C/min</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Heat:</span>
              <span className="text-[--color-roast-heat]">{currentData.heat}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Fan:</span>
              <span className="text-[--color-roast-fan]">{currentData.fan}%</span>
            </div>
          </div>
        ) : (
          // Legend (when not hovering)
          <div className="flex gap-4 text-xs text-white">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[--color-roast-caution]" />
              <span>Bean Temp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[--color-roast-fan]" />
              <span>Env Temp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[--color-roast-nominal]" />
              <span>RoR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0 border-t-2 border-dashed border-[--color-roast-heat]" />
              <span>Heat %</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0 border-t-2 border-dashed border-[--color-roast-fan]" />
              <span>Fan %</span>
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="time"
            stroke="#a1a1aa"
            tick={{ fill: "#d4d4d8", fontSize: 12 }}
            label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#d4d4d8" }}
            tickFormatter={(value) => formatTime(value)}
          />
          <YAxis
            yAxisId="temp"
            stroke="#a1a1aa"
            tick={{ fill: "#d4d4d8", fontSize: 12 }}
            label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft", fill: "#d4d4d8" }}
            domain={[0, 250]}
          />
          <YAxis
            yAxisId="ror"
            orientation="right"
            stroke="#a1a1aa"
            tick={{ fill: "#d4d4d8", fontSize: 12 }}
            label={{ value: "RoR (°C/min)", angle: 90, position: "insideRight", fill: "#d4d4d8" }}
            domain={[0, 30]}
          />
          {/* Hidden 0-100% scale for control-value step lines (heat/fan) */}
          <YAxis yAxisId="pct" hide domain={[0, 100]} />
          <Tooltip
            content={() => null}
            cursor={{ stroke: "#ffffff", strokeWidth: 1, strokeDasharray: "3 3" }}
          />

          {events.map((event, i) => (
            <ReferenceLine
              key={i}
              x={event.time}
              yAxisId="temp"
              stroke={event.color}
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: event.label,
                position: "top",
                fill: event.color,
                fontSize: 11,
                fontFamily: "monospace",
              }}
            />
          ))}

          {/* Selected decision-trace row → highlight marker */}
          {highlightTime !== null && highlightTime !== undefined && (
            <ReferenceLine
              x={highlightTime}
              yAxisId="temp"
              stroke="#ffffff"
              strokeWidth={2}
              label={{
                value: `DECISION ${formatTime(highlightTime)}`,
                position: "insideTopLeft",
                fill: "#ffffff",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            />
          )}

          {/* Control values: step lines (Artisan convention) — thinner, dashed, dimmer */}
          <Line
            yAxisId="pct"
            type="stepAfter"
            dataKey="heat"
            stroke="var(--color-roast-heat)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            strokeOpacity={0.75}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="pct"
            type="stepAfter"
            dataKey="fan"
            stroke="var(--color-roast-fan)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            strokeOpacity={0.75}
            dot={false}
            isAnimationActive={false}
          />

          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="beanTemp"
            stroke="var(--color-roast-caution)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="envTemp"
            stroke="var(--color-roast-fan)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="ror"
            type="monotone"
            dataKey="ror"
            stroke="var(--color-roast-nominal)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
