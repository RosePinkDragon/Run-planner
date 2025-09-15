import type { RunDBV1 } from "@/store/runs";

const STORAGE_KEY = "runlogger.v1";

export function loadDB(): RunDBV1 {
  if (typeof localStorage === "undefined") return { version: 1, runs: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RunDBV1;
  } catch {
    /* ignore */
  }
  return { version: 1, runs: [] };
}

export const saveDB = (() => {
  let timeout: number | undefined;
  return (db: RunDBV1) => {
    if (typeof localStorage === "undefined") return;
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }, 300);
  };
})();

export function resetDB() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
