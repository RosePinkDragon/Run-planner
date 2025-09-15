/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { loadDB, saveDB, resetDB } from "@/lib/storage";
import { calcPace } from "@/lib/calc";

export type RunType =
  | "Easy"
  | "Tempo"
  | "Intervals"
  | "Hill"
  | "Long"
  | "Recovery"
  | "Strength";

export interface RunEntry {
  id: string;
  date: string; // YYYY-MM-DD
  distanceKm: number; // 0 for Strength
  durationSec: number; // 0 allowed for Strength
  paceSecPerKm: number; // derived; 0 if distance==0
  type: RunType;
  rpe?: number; // 1..10
  tags?: string[];
  notes?: string;
}

export interface RunDBV1 {
  version: 1;
  runs: RunEntry[];
}

interface RunsContextValue {
  runs: RunEntry[];
  addRun: (run: Omit<RunEntry, "id" | "paceSecPerKm">) => void;
  updateRun: (run: RunEntry) => void;
  deleteRun: (id: string) => void;
  duplicateRun: (id: string) => void;
  importRuns: (data: RunDBV1, mode: "merge" | "replace") => void;
  reset: () => void;
}

const RunsContext = createContext<RunsContextValue | undefined>(undefined);

export function RunsProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<RunEntry[]>(() => loadDB().runs);

  useEffect(() => {
    saveDB({ version: 1, runs });
  }, [runs]);

  const addRun: RunsContextValue["addRun"] = (run) => {
    const paceSecPerKm = calcPace(run.durationSec, run.distanceKm);
    setRuns((r) => [...r, { ...run, id: crypto.randomUUID(), paceSecPerKm }]);
  };

  const updateRun: RunsContextValue["updateRun"] = (run) => {
    setRuns((r) => r.map((x) => (x.id === run.id ? { ...run, paceSecPerKm: calcPace(run.durationSec, run.distanceKm) } : x)));
  };

  const deleteRun = (id: string) => setRuns((r) => r.filter((x) => x.id !== id));

  const duplicateRun = (id: string) => {
    const orig = runs.find((r) => r.id === id);
    if (orig) {
      const copy = { ...orig, id: crypto.randomUUID() };
      setRuns((r) => [...r, copy]);
    }
  };

  const importRuns = (data: RunDBV1, mode: "merge" | "replace") => {
    if (mode === "replace") setRuns(data.runs);
    else setRuns((r) => [...r, ...data.runs]);
  };

  const reset = () => {
    resetDB();
    setRuns([]);
  };

  return (
    <RunsContext.Provider
      value={{ runs, addRun, updateRun, deleteRun, duplicateRun, importRuns, reset }}
    >
      {children}
    </RunsContext.Provider>
  );
}

export function useRuns() {
  const ctx = useContext(RunsContext);
  if (!ctx) throw new Error("RunsProvider missing");
  return ctx;
}
