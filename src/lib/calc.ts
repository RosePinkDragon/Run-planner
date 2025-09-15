import type { RunEntry } from "@/store/runs";

export function calcPace(durationSec: number, distanceKm: number): number {
  if (!distanceKm) return 0;
  return durationSec / distanceKm;
}

export function sumDistance(runs: RunEntry[]): number {
  return runs.reduce((acc, r) => acc + r.distanceKm, 0);
}

export function sumDuration(runs: RunEntry[]): number {
  return runs.reduce((acc, r) => acc + r.durationSec, 0);
}

export function avgPace(runs: RunEntry[]): number {
  const totalDistance = sumDistance(runs);
  const totalDuration = sumDuration(runs);
  return calcPace(totalDuration, totalDistance);
}

function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function groupByWeek(runs: RunEntry[]): Record<string, RunEntry[]> {
  return runs.reduce<Record<string, RunEntry[]>>((acc, run) => {
    const { year, week } = isoWeek(new Date(run.date));
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    acc[key] = acc[key] || [];
    acc[key].push(run);
    return acc;
  }, {});
}

export function groupByMonth(runs: RunEntry[]): Record<string, RunEntry[]> {
  return runs.reduce<Record<string, RunEntry[]>>((acc, run) => {
    const d = new Date(run.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = acc[key] || [];
    acc[key].push(run);
    return acc;
  }, {});
}
