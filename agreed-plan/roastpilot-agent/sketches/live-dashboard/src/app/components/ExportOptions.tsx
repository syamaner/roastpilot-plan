import { Download, FileText, Table, FileJson } from "lucide-react";

interface ExportOptionsProps {
  onExport: (format: "jsonl" | "csv" | "json") => void;
}

export function ExportOptions({ onExport }: ExportOptionsProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-4">Export Roast Data</h3>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onExport("jsonl")}
          className="flex flex-col items-center gap-2 px-4 py-4 bg-background hover:bg-muted border border-border rounded-lg transition-colors group"
        >
          <FileText size={24} className="text-zinc-400 group-hover:text-white transition-colors" />
          <div className="text-sm font-mono text-white">JSONL</div>
          <div className="text-xs text-zinc-500">Line-delimited logs</div>
        </button>

        <button
          onClick={() => onExport("csv")}
          className="flex flex-col items-center gap-2 px-4 py-4 bg-background hover:bg-muted border border-border rounded-lg transition-colors group"
        >
          <Table size={24} className="text-zinc-400 group-hover:text-white transition-colors" />
          <div className="text-sm font-mono text-white">CSV</div>
          <div className="text-xs text-zinc-500">Spreadsheet format</div>
        </button>

        <button
          onClick={() => onExport("json")}
          className="flex flex-col items-center gap-2 px-4 py-4 bg-background hover:bg-muted border border-border rounded-lg transition-colors group"
        >
          <FileJson size={24} className="text-zinc-400 group-hover:text-white transition-colors" />
          <div className="text-sm font-mono text-white">Summary JSON</div>
          <div className="text-xs text-zinc-500">Structured summary</div>
        </button>
      </div>

      <div className="mt-4 text-xs text-zinc-500 leading-relaxed">
        Export includes temperature data, decision trace, events, and ratings.
      </div>
    </div>
  );
}
