import { useState, useRef } from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { useRuns, type RunEntry } from "@/store/runs";
import AddEditRunForm from "@/components/AddEditRunForm";
import FiltersBar, { type Filters } from "@/components/FiltersBar";
import RunsTable from "@/components/RunsTable";
import StatsCards from "@/components/StatsCards";

export default function Home() {
  const { runs, importRuns, reset } = useRuns();
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<RunEntry | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = runs.filter((r) => {
    if (filters.type && r.type !== filters.type) return false;
    if (filters.from && r.date < filters.from) return false;
    if (filters.to && r.date > filters.to) return false;
    if (filters.text) {
      const t = filters.text.toLowerCase();
      const tags = r.tags?.join(",").toLowerCase() || "";
      const notes = r.notes?.toLowerCase() || "";
      if (!tags.includes(t) && !notes.includes(t)) return false;
    }
    return true;
  });

  const openNew = () => {
    setEditing(null);
    onOpen();
  };

  const openEdit = (run: RunEntry) => {
    setEditing(run);
    onOpen();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ version: 1, runs }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "runs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = "date,distance_km,duration_sec,pace_sec_per_km,type,rpe,tags,notes";
    const rows = runs.map((r) =>
      [
        r.date,
        r.distanceKm,
        r.durationSec,
        r.paceSecPerKm,
        r.type,
        r.rpe ?? "",
        r.tags?.join("|") ?? "",
        r.notes ?? "",
      ].join(","),
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "runs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const data = JSON.parse(text);
        if (data.version === 1 && Array.isArray(data.runs)) {
          const mode = window.confirm("Replace existing data? Click OK to replace, Cancel to merge")
            ? "replace"
            : "merge";
          importRuns(data, mode);
        } else {
          alert("Invalid file");
        }
      } catch {
        alert("Invalid file");
      }
    });
  };

  const triggerImport = () => fileRef.current?.click();

  const handleReset = () => {
    if (window.confirm("Reset all data?")) reset();
  };

  return (
    <VStack align="stretch" gap={4} p={4}>
      <HStack justify="space-between" gap={4}>
        <HStack gap={2}>
          <Box fontWeight="bold">Run Logger</Box>
          <Button colorScheme="blue" onClick={openNew}>
            Add Run
          </Button>
        </HStack>
        <HStack gap={2}>
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={exportJSON}>Export JSON</Button>
          <Button onClick={triggerImport}>Import JSON</Button>
          <Button onClick={handleReset}>Reset Data</Button>
        </HStack>
        <Input
          type="file"
          accept="application/json"
          ref={fileRef}
          display="none"
          onChange={handleImport}
        />
      </HStack>
      <StatsCards runs={runs} />
      <FiltersBar value={filters} onChange={setFilters} onClear={() => setFilters({})} />
      <RunsTable runs={filtered} onEdit={openEdit} />
      <AddEditRunForm isOpen={isOpen} onClose={onClose} initialRun={editing || undefined} />
    </VStack>
  );
}
