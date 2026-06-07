import { useState } from "react";
import { RoastDetailHeader } from "./RoastDetailHeader";
import { RoastCurveChart } from "./RoastCurveChart";
import { DecisionTraceTable } from "./DecisionTraceTable";
import { EventTimeline } from "./EventTimeline";
import { RoastRating } from "./RoastRating";
import { ExportOptions } from "./ExportOptions";

interface RoastDetailLayout1Props {
  mockData: any;
}

function timeToSeconds(mmss: string): number {
  const [m, s] = mmss.split(":").map(Number);
  return m * 60 + s;
}

export function RoastDetailLayout1({ mockData }: RoastDetailLayout1Props) {
  // Trace-row -> chart highlight: selecting a decision marks its timestamp on the curve.
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const selectedDecision = mockData.decisions.find((d: any) => d.id === selectedDecisionId);
  const highlightTime = selectedDecision ? timeToSeconds(selectedDecision.time) : null;

  return (
    <div className="h-screen overflow-y-auto bg-background dark p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <RoastDetailHeader {...mockData.header} />

        {/* Chart + Timeline Side by Side */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-[400px]">
            <RoastCurveChart
              data={mockData.chartData}
              events={mockData.chartEvents}
              highlightTime={highlightTime}
            />
          </div>
          <div>
            <EventTimeline events={mockData.timelineEvents} />
          </div>
        </div>

        {/* Decision Trace Table - Full Width (Heart of the Screen) */}
        <DecisionTraceTable
          decisions={mockData.decisions}
          selectedId={selectedDecisionId}
          onSelectRow={(d) => setSelectedDecisionId(d.id === selectedDecisionId ? null : d.id)}
        />

        {/* Rating + Export */}
        <div className="grid grid-cols-2 gap-6">
          <RoastRating onSave={(rating, notes) => console.log(rating, notes)} />
          <ExportOptions onExport={(format) => console.log(format)} />
        </div>

        <div className="absolute top-8 right-8 px-3 py-1 bg-[--color-roast-phase-preheat] rounded-md text-xs font-mono text-black">
          Layout 1: Timeline Right, Decision Table Emphasized
        </div>
      </div>
    </div>
  );
}
