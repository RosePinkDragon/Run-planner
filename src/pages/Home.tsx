import { useState, useRef } from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRuns, type RunEntry, type RunDBV1 } from "@/store/runs";
import AddEditRunForm from "@/components/AddEditRunForm";
import FiltersBar, { type Filters } from "@/components/FiltersBar";
import RunsTable from "@/components/RunsTable";
import StatsCards from "@/components/StatsCards";
import CalendarView from "@/components/CalendarView";
import { parseXlsx } from "@/lib/excel";

export default function Home() {
  const { runs, importRuns, reset } = useRuns();
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const importDialog = useDisclosure();
  const resetDialog = useDisclosure();
  const [editing, setEditing] = useState<RunEntry | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const excelRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<RunDBV1 | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  const filtered = runs.filter((r) => {
    if (filters.type && r.type !== filters.type) return false;
    if (filters.status && (r.status ?? "done") !== filters.status) return false;
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
    const header =
      "date,distance_km,duration_sec,pace_sec_per_km,type,rpe,tags,notes,status";
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
        r.status ?? "done",
      ]
        .map((v) => escape(v))
        .join(",")
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
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
          alert("File structure is incorrect or missing required fields.");
        }
      } catch {
        alert("File is not valid JSON.");
      }
    });
  };

  const confirmImport = (mode: "merge" | "replace") => {
    if (pendingImport) importRuns(pendingImport, mode);
    setPendingImport(null);
    importDialog.onClose();
  };

  const triggerImport = () => fileRef.current?.click();
  const triggerExcelImport = () => excelRef.current?.click();

  const importExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseXlsx(file)
      .then((items: RunEntry[]) => {
        importRuns({ version: 1, runs: items }, "merge");
      })
      .finally(() => {
        if (e.target) e.target.value = "";
      });
  };

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
          <Button
            variant={view === "list" ? "solid" : "outline"}
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "calendar" ? "solid" : "outline"}
            onClick={() => setView("calendar")}
          >
            Calendar
          </Button>
        </HStack>
        <HStack gap={2}>
          <Button onClick={openNew}>Add Run</Button>
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={exportJSON}>Export JSON</Button>
          <Button onClick={triggerImport}>Import JSON</Button>
          <Button onClick={triggerExcelImport}>Import Excel</Button>
          <Button onClick={handleReset}>Reset Data</Button>
        </HStack>
        <Input
          type="file"
          accept="application/json"
          ref={fileRef}
          display="none"
          onChange={handleImport}
        />
        <Input
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          ref={excelRef}
          display="none"
          onChange={importExcel}
        />
      </HStack>
      {view === "list" ? (
        <>
          <StatsCards runs={runs} />
          <FiltersBar
            value={filters}
            onChange={setFilters}
            onClear={() => setFilters({})}
          />
          <RunsTable runs={filtered} onEdit={openEdit} />
        </>
      ) : (
        <CalendarView />
      )}
      <AddEditRunForm
        isOpen={isOpen}
        onClose={onClose}
        initialRun={editing || undefined}
      />
      <DialogRoot
        open={importDialog.open}
        lazyMount
        onOpenChange={(e) =>
          e.open ? importDialog.onOpen() : importDialog.onClose()
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Runs</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription mb="2">
              Choose how to handle the imported runs.
            </DialogDescription>
            <Box>How should the imported runs be handled?</Box>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setPendingImport(null);
                }}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button onClick={() => confirmImport("merge")}>Merge</Button>
            <Button colorScheme="red" onClick={() => confirmImport("replace")}>
              Replace
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        role="alertdialog"
        open={resetDialog.open}
        lazyMount
        onOpenChange={(e) =>
          e.open ? resetDialog.onOpen() : resetDialog.onClose()
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Data</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription mb="2">
              This action will permanently remove all runs from this device.
            </DialogDescription>
            <Box>This will remove all runs.</Box>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button colorScheme="red" onClick={confirmReset}>
              Reset
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </VStack>
  );
}
