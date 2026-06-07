import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";

interface ChartDataPoint {
  time: number;
  beanTemp: number;
  envTemp: number;
  ror: number;
  heat: number;
  fan: number;
}

interface TemperatureChartProps {
  data: ChartDataPoint[];
  phase: string;
  showChargeZone?: boolean;
}

export function TemperatureChart({ data, phase, showChargeZone }: TemperatureChartProps) {
  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="bg-card rounded-lg border border-border p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm uppercase tracking-wide text-zinc-400">
          Temperature Profile
        </h3>
        {/* Legend doubles as a live readout of each series' current value */}
        <div className="flex gap-4 text-xs text-white font-mono pr-14">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[--color-roast-caution]" />
            <span className="text-zinc-400">Bean</span>
            <span>{latest ? `${latest.beanTemp.toFixed(1)}°C` : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[--color-roast-fan]" />
            <span className="text-zinc-400">Env</span>
            <span>{latest ? `${latest.envTemp.toFixed(1)}°C` : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[--color-roast-nominal]" />
            <span className="text-zinc-400">RoR</span>
            <span>{latest ? `${latest.ror.toFixed(1)}°C/min` : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0 border-t-2 border-dashed border-[--color-roast-heat]" />
            <span className="text-zinc-400">Heat</span>
            <span>{latest ? `${latest.heat}%` : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0 border-t-2 border-dashed border-[--color-roast-fan]" />
            <span className="text-zinc-400">Fan</span>
            <span>{latest ? `${latest.fan}%` : "—"}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="time"
            stroke="#a1a1aa"
            tick={{ fill: "#d4d4d8", fontSize: 12 }}
            label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#d4d4d8" }}
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
            contentStyle={{
              backgroundColor: "#1a1a1f",
              border: "1px solid #2a2a30",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />

          {showChargeZone && (
            <ReferenceArea
              yAxisId="temp"
              y1={180}
              y2={210}
              fill="#f59e0b"
              fillOpacity={0.1}
              stroke="#f59e0b"
              strokeOpacity={0.3}
              strokeDasharray="3 3"
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
