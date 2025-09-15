export function parseDuration(value: string): number {
  const parts = value.trim().split(":").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  const [h, m, s] = parts;
  return h * 3600 + m * 60 + s;
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatPace(secPerKm: number): string {
  if (!secPerKm) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
