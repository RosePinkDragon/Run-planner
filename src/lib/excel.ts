import * as XLSX from "xlsx";
import { calcPace } from "@/lib/calc";
import type { RunEntry, RunType } from "@/store/runs";

type Row = {
  date: string;
  distance_km?: number | string;
  duration_sec?: number | string;
  type?: RunType | string;
  rpe?: number | string;
  tags?: string;
  notes?: string;
  status?: "planned" | "done" | string;
};

export async function parseXlsx(file: File): Promise<RunEntry[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Row>(ws, { raw: true, defval: "" });

  return rows
    .filter((r: Row) => typeof r.date === "string" && r.date.length >= 8)
    .map((r: Row) => {
      const distanceKm = Number(r.distance_km ?? 0) || 0;
      const durationSec = Number(r.duration_sec ?? 0) || 0;
      const type = ((r.type as RunType) || "Easy") as RunType;
      const tags = (r.tags ?? "")
        .split(/[;,]/)
        .map((t: string) => t.trim())
        .filter(Boolean);
      const status = (r.status === "done" ? "done" : "planned") as
        | "planned"
        | "done";

      return {
        id: crypto.randomUUID(),
        date: r.date,
        distanceKm,
        durationSec,
        paceSecPerKm: calcPace(durationSec, distanceKm),
        type,
        rpe:
          r.rpe !== undefined && r.rpe !== null && r.rpe !== ""
            ? Number(r.rpe)
            : undefined,
        tags,
        notes: r.notes ?? "",
        status,
      } satisfies RunEntry;
    });
}
