import { useState, useRef } from "react";
import { Box, Button, HStack, VStack, useDisclosure, Input } from "@chakra-ui/react";
import { useRuns, type RunEntry, type RunDBV1 } from "@/store/runs";
import AddEditRunForm from "@/components/AddEditRunForm";
import FiltersBar, { type Filters } from "@/components/FiltersBar";
import RunsTable from "@/components/RunsTable";
import StatsCards from "@/components/StatsCards";

export default function Home() {
  const { runs, importRuns, reset } = useRuns();
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const importDialog = useDisclosure();
  const resetDialog = useDisclosure();
  const [editing, setEditing] = useState<RunEntry | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<RunDBV1 | null>(null);

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
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const rows = runs.map((r) =>
      [
        r.date,
        r.distanceKm.toString(),
        r.durationSec.toString(),
        r.paceSecPerKm.toString(),
        r.type,
        r.rpe?.toString() ?? "",
        r.tags?.join(";") ?? "",
        r.notes ?? "",
      ]
        .map((v) => escape(v))
        .join(","),
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
          setPendingImport(data);
          importDialog.onOpen();
        } else {
          alert("Invalid file");
        }
      } catch {
        alert("Invalid file");
      }
    });
  };

  const confirmImport = (mode: "merge" | "replace") => {
    if (pendingImport) importRuns(pendingImport, mode);
    setPendingImport(null);
    importDialog.onClose();
  };

  const triggerImport = () => fileRef.current?.click();

  const handleReset = () => {
    resetDialog.onOpen();
  };

  const confirmReset = () => {
    reset();
    resetDialog.onClose();
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
      {importDialog.open && (
        <Box position="fixed" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center">
          <Box bg="white" p={4} rounded="md" minW="300px">
            <VStack align="stretch" gap={4}>
              <Box fontWeight="bold">Import Runs</Box>
              <Box>How should the imported runs be handled?</Box>
              <HStack justify="flex-end" gap={3}>
                <Button
                  onClick={() => {
                    setPendingImport(null);
                    importDialog.onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => confirmImport("merge")}>Merge</Button>
                <Button colorScheme="red" onClick={() => confirmImport("replace")}>
                  Replace
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
      {resetDialog.open && (
        <Box position="fixed" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center">
          <Box bg="white" p={4} rounded="md" minW="300px">
            <VStack align="stretch" gap={4}>
              <Box fontWeight="bold">Reset Data</Box>
              <Box>This will remove all runs.</Box>
              <HStack justify="flex-end" gap={3}>
                <Button onClick={resetDialog.onClose}>Cancel</Button>
                <Button colorScheme="red" onClick={confirmReset}>
                  Reset
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </VStack>
  );
}
