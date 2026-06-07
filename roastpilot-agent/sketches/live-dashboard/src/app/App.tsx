import { useState } from "react";
import { Layout3Enhanced } from "./components/Layout3Enhanced";
import { RoastDetailLayout1 } from "./components/RoastDetailLayout1";
import { RoastHistoryScreen } from "./components/RoastHistoryScreen";

export default function App() {
  const [viewMode, setViewMode] = useState<"live" | "detail" | "history">("history");
  const [stateMode, setStateMode] = useState<"normal" | "recovery" | "fault">("normal");
  const [showEmptyHistory, setShowEmptyHistory] = useState(false);

  const mockData = {
    phase: "Preheating",
    roastTime: "02:45",
    developmentTime: "00:00",
    developmentPercent: 0,
    profileName: "Ethiopian Light - Natural",
    connectionStatus: "connected" as const,
    chartData: generateChartData(),
    heat: {
      current: 75,
      target: 80,
      advisorTarget: 78,
    },
    fan: {
      current: 45,
      target: 45,
      advisorTarget: 50,
    },
    latestDecision: {
      timestamp: "02:45",
      recommendation: "Increase heat to 78% to reach charge zone",
      confidence: 0.85,
      rationale: "Temperature climbing steadily. Current RoR suggests we can safely increase heat to reach optimal charge temperature of 195°C within 30 seconds.",
      verdict: "ACCEPT" as const,
    },
    decisionHistory: [
      {
        timestamp: "02:30",
        recommendation: "Maintain current heat, increase fan to 50%",
        confidence: 0.72,
        rationale: "Approaching charge zone",
        verdict: "CLAMP" as const,
      },
      {
        timestamp: "02:15",
        recommendation: "Reduce heat to 65%",
        confidence: 0.65,
        rationale: "RoR too aggressive",
        verdict: "REJECT" as const,
      },
      {
        timestamp: "02:00",
        recommendation: "Increase heat to 80%",
        confidence: 0.90,
        rationale: "Preheat acceleration needed",
        verdict: "ACCEPT" as const,
      },
      {
        timestamp: "01:45",
        recommendation: "Maintain current settings",
        confidence: 0.88,
        rationale: "Stable climb observed",
        verdict: "ACCEPT" as const,
      },
    ],
  };

  const historyMockData = generateHistoryData();

  const detailMockData = {
    header: {
      roastName: "Ethiopian Yirgacheffe — Medium",
      date: "2026-06-06 14:32",
      outcome: "COMPLETED" as const,
      totalTime: "12:54",
      firstCrackTime: "08:30",
      firstCrackTemp: 201.2,
      dropTime: "10:45",
      dropTemp: 218.5,
      developmentPercent: 21.0,
    },
    chartData: generateDetailChartData(),
    chartEvents: [
      { time: 0, label: "T0", color: "#94a3b8" },
      { time: 510, label: "1C", color: "#fbbf24" },
      { time: 645, label: "Drop", color: "#f87171" },
      { time: 645, label: "Cool", color: "#22d3ee" },
    ],
    timelineEvents: [
      { time: "00:00", label: "T0 — Beans charged", icon: "start" as const, detail: "Bean temp at charge: 195°C" },
      { time: "08:30", label: "First crack detected", icon: "crack" as const, detail: "Audio model detection", confidence: 0.94 },
      { time: "10:45", label: "Beans dropped", icon: "drop" as const, detail: "Final temp: 218.5°C" },
      { time: "10:45", label: "Cooling started", icon: "cooling" as const },
      { time: "15:20", label: "Cooling complete", icon: "cooling" as const },
      { time: "15:22", label: "Export completed", icon: "complete" as const, detail: "Data saved to roast-2026-06-06-1432.jsonl" },
    ],
    decisions: [
      {
        id: "1",
        time: "00:45",
        recommendedHeat: 75,
        recommendedFan: 45,
        verdict: "ACCEPT" as const,
        executedHeat: 75,
        executedFan: 45,
        rationale: "Initial ramp phase. Temperature climbing steadily at 12°C/min, within optimal range for light roast development.",
      },
      {
        id: "2",
        time: "02:15",
        recommendedHeat: 85,
        recommendedFan: 40,
        verdict: "CLAMP" as const,
        executedHeat: 80,
        executedFan: 42,
        rationale: "Recommended heat increase would push RoR above 18°C/min safety threshold. Clamped to 80% heat and increased fan to 42% to maintain safe acceleration curve while still progressing toward yellowing phase.",
      },
      {
        id: "3",
        time: "04:30",
        recommendedHeat: 65,
        recommendedFan: 50,
        verdict: "ACCEPT" as const,
        executedHeat: 65,
        executedFan: 50,
        rationale: "Approaching Maillard phase. Reducing heat and increasing airflow to control RoR descent and prevent stalling.",
      },
      {
        id: "4",
        time: "06:00",
        recommendedHeat: 55,
        recommendedFan: 60,
        verdict: "REJECT" as const,
        executedHeat: 62,
        executedFan: 55,
        rationale: "Recommendation would cause temperature crash below minimum development rate of 5°C/min for this bean density. Safety layer rejected and maintained prior settings to preserve momentum through Maillard reactions.",
      },
      {
        id: "5",
        time: "07:45",
        recommendedHeat: 68,
        recommendedFan: 52,
        verdict: "ACCEPT" as const,
        executedHeat: 68,
        executedFan: 52,
        rationale: "Pre-first-crack preparation. Gentle heat increase to maintain 8-10°C/min RoR leading into crack.",
      },
      {
        id: "6",
        time: "09:20",
        recommendedHeat: 62,
        recommendedFan: 55,
        verdict: "ACCEPT" as const,
        executedHeat: 62,
        executedFan: 55,
        rationale: "Post-crack development phase. Gradual heat reduction while maintaining airflow for even development to target 21% development ratio.",
      },
      {
        id: "7",
        time: "10:30",
        recommendedHeat: 58,
        recommendedFan: 58,
        verdict: "ACCEPT" as const,
        executedHeat: 58,
        executedFan: 58,
        rationale: "Final approach to drop temp. Coasting to target 218°C with controlled deceleration.",
      },
    ],
  };

  return (
    <div className="relative size-full">
      {viewMode === "history" ? (
        <>
          <RoastHistoryScreen
            mockRoasts={showEmptyHistory ? [] : historyMockData}
            onRowClick={(id) => {
              console.log("View roast detail:", id);
              setViewMode("detail");
            }}
            onStartRoast={() => {
              console.log("Start new roast");
              setViewMode("live");
            }}
          />

          {/* Empty State Toggle */}
          <div className="fixed bottom-6 right-6 bg-card border border-border rounded-lg p-2 shadow-lg z-50">
            <button
              onClick={() => setShowEmptyHistory(!showEmptyHistory)}
              className="px-4 py-2 rounded font-mono text-xs transition-colors bg-background text-white hover:bg-muted"
            >
              {showEmptyHistory ? "Show Mock Data" : "Show Empty State"}
            </button>
          </div>
        </>
      ) : viewMode === "live" ? (
        <>
          <Layout3Enhanced
            mockData={mockData}
            showRecoveryModal={stateMode === "recovery"}
            showFaultBanner={stateMode === "fault"}
          />

          {/* State Mode Selector */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-card border border-border rounded-lg p-2 shadow-lg z-50">
            <button
              onClick={() => setStateMode("normal")}
              className={`px-4 py-2 rounded font-mono text-xs transition-colors ${
                stateMode === "normal"
                  ? "bg-[--color-roast-nominal] text-black"
                  : "bg-background text-white hover:bg-muted"
              }`}
            >
              Normal Operation
            </button>
            <button
              onClick={() => setStateMode("recovery")}
              className={`px-4 py-2 rounded font-mono text-xs transition-colors ${
                stateMode === "recovery"
                  ? "bg-[--color-roast-caution] text-black"
                  : "bg-background text-white hover:bg-muted"
              }`}
            >
              Operator Recovery
            </button>
            <button
              onClick={() => setStateMode("fault")}
              className={`px-4 py-2 rounded font-mono text-xs transition-colors ${
                stateMode === "fault"
                  ? "bg-[--color-roast-fault] text-white"
                  : "bg-background text-white hover:bg-muted"
              }`}
            >
              Fault State
            </button>
          </div>
        </>
      ) : (
        <RoastDetailLayout1 mockData={detailMockData} />
      )}

      {/* View Mode Toggle */}
      <div className="fixed top-6 left-6 flex gap-2 bg-card border border-border rounded-lg p-2 shadow-lg z-50">
        <button
          onClick={() => setViewMode("history")}
          className={`px-4 py-2 rounded font-mono text-xs transition-colors ${
            viewMode === "history"
              ? "bg-[--color-roast-nominal] text-black"
              : "bg-background text-white hover:bg-muted"
          }`}
        >
          Roast History
        </button>
        <button
          onClick={() => setViewMode("live")}
          className={`px-4 py-2 rounded font-mono text-xs transition-colors ${
            viewMode === "live"
              ? "bg-[--color-roast-nominal] text-black"
              : "bg-background text-white hover:bg-muted"
          }`}
        >
          Live Dashboard
        </button>
        <button
          onClick={() => setViewMode("detail")}
          className={`px-4 py-2 rounded font-mono text-xs transition-colors ${
            viewMode === "detail"
              ? "bg-[--color-roast-nominal] text-black"
              : "bg-background text-white hover:bg-muted"
          }`}
        >
          Roast Detail
        </button>
      </div>
    </div>
  );
}

function generateHistoryData() {
  const beans = [
    { name: "Ethiopian Yirgacheffe", origin: "Ethiopian" },
    { name: "Colombian Supremo", origin: "Colombian" },
    { name: "Brazilian Santos", origin: "Brazilian" },
    { name: "Kenyan AA", origin: "Kenyan" },
    { name: "Guatemalan Antigua", origin: "Guatemalan" },
    { name: "Ethiopian Sidamo", origin: "Ethiopian" },
  ];

  const profiles = ["Light", "Medium", "Medium-Dark", "Dark", "City+", "Full City"];
  const outcomes: ("COMPLETED" | "ABORTED" | "FAULT")[] = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "ABORTED", "FAULT"];

  const roasts = [];
  for (let i = 0; i < 24; i++) {
    const bean = beans[i % beans.length];
    const profile = profiles[Math.floor(Math.random() * profiles.length)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const rating = outcome === "COMPLETED" ? Math.floor(Math.random() * 3) + 3 : 0;

    const sparkline = [];
    for (let j = 0; j <= 20; j++) {
      sparkline.push(80 + (j / 20) * 140 + Math.sin(j / 3) * 8);
    }

    const date = new Date(2026, 5, 6 - i);
    roasts.push({
      id: `roast-${i}`,
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(14 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
      bean: bean.name,
      profile: profile,
      outcome: outcome,
      firstCrackTime: `${String(Math.floor(Math.random() * 3) + 7).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      dropTemp: Math.round(210 + Math.random() * 15),
      developmentPercent: Math.round(18 + Math.random() * 6),
      rating: rating,
      sparklineData: sparkline,
    });
  }

  return roasts;
}

// Control values (heat/fan %) as step functions derived from the executed
// decisions in the trace: 00:45 H75/F45, 02:15 H80/F42, 04:30 H65/F50,
// 06:00 H62/F55, 07:45 H68/F52, 09:20 H62/F55, 10:30 H58/F58, drop 10:45.
function detailControlsAt(t: number): { heat: number; fan: number } {
  if (t >= 645) return { heat: 0, fan: 100 }; // dropped → cooling
  if (t >= 630) return { heat: 58, fan: 58 };
  if (t >= 560) return { heat: 62, fan: 55 };
  if (t >= 465) return { heat: 68, fan: 52 };
  if (t >= 360) return { heat: 62, fan: 55 };
  if (t >= 270) return { heat: 65, fan: 50 };
  if (t >= 135) return { heat: 80, fan: 42 };
  if (t >= 45) return { heat: 75, fan: 45 };
  return { heat: 70, fan: 40 };
}

function generateDetailChartData() {
  const data = [];
  for (let i = 0; i <= 774; i += 3) {
    let beanTemp;
    if (i <= 510) {
      // Up to first crack
      beanTemp = 80 + (i / 510) * 121.2 + Math.sin(i / 60) * 3;
    } else {
      // After first crack to drop
      beanTemp = 201.2 + ((i - 510) / (645 - 510)) * 17.3 + Math.sin(i / 40) * 2;
    }
    const envTemp = beanTemp + 15 + Math.random() * 8;
    const ror = 5 + Math.sin(i / 80) * 6 + Math.random() * 2;
    const controls = detailControlsAt(i);

    data.push({
      time: i,
      beanTemp: Math.round(beanTemp * 10) / 10,
      envTemp: Math.round(envTemp * 10) / 10,
      ror: Math.round(ror * 10) / 10,
      heat: controls.heat,
      fan: controls.fan,
    });
  }
  return data;
}

function generateChartData() {
  const data = [];
  for (let i = 0; i <= 165; i += 5) {
    const beanTemp = 80 + (i / 165) * 120 + Math.random() * 5;
    const envTemp = beanTemp + 15 + Math.random() * 10;
    const ror = 5 + Math.sin(i / 30) * 8 + Math.random() * 3;
    // Control steps matching the decision history (01:45 maintain, 02:00 heat→80 ACCEPT,
    // 02:30 fan→50 CLAMP→45): heat 65 → 72 → 75, fan 40 → 45.
    const heat = i >= 120 ? 75 : i >= 60 ? 72 : 65;
    const fan = i >= 90 ? 45 : 40;

    data.push({
      time: i,
      beanTemp: Math.round(beanTemp * 10) / 10,
      envTemp: Math.round(envTemp * 10) / 10,
      ror: Math.round(ror * 10) / 10,
      heat,
      fan,
    });
  }
  return data;
}