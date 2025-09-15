import { Box, Button, HStack } from "@chakra-ui/react";
import type { RunEntry } from "@/store/runs";
import { useRuns } from "@/store/runs";
import { formatDuration, formatPace } from "@/lib/time";
import { useState } from "react";

interface Props {
  runs: RunEntry[];
  onEdit: (run: RunEntry) => void;
}

export default function RunsTable({ runs, onEdit }: Props) {
  const { deleteRun, duplicateRun } = useRuns();
  const [sort, setSort] = useState<
    { key: "date" | "distance" | "duration"; dir: 1 | -1 }
  >();

  const sorted = [...runs].sort((a, b) => {
    if (!sort) return 0;
    const dir = sort.dir;
    switch (sort.key) {
      case "date":
        return dir * a.date.localeCompare(b.date);
      case "distance":
        return dir * (a.distanceKm - b.distanceKm);
      case "duration":
        return dir * (a.durationSec - b.durationSec);
      default:
        return 0;
    }
  });

  const toggleSort = (key: "date" | "distance" | "duration") => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: 1 };
      return { key, dir: s.dir === 1 ? -1 : 1 };
    });
  };

  const header = (label: string, key: "date" | "distance" | "duration") => (
    <th style={{ cursor: "pointer" }} onClick={() => toggleSort(key)}>
      {label} {sort?.key === key ? (sort.dir === 1 ? "▲" : "▼") : ""}
    </th>
  );

  return (
    <Box overflowX="auto">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {header("Date", "date")}
            {header("Distance (km)", "distance")}
            {header("Duration", "duration")}
            <th>Pace</th>
            <th>Type</th>
            <th>Effort</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((run) => (
            <tr key={run.id}>
              <td>{run.date}</td>
              <td>{run.distanceKm.toFixed(2)}</td>
              <td>{formatDuration(run.durationSec)}</td>
              <td>{formatPace(run.paceSecPerKm)}</td>
              <td>{run.type}</td>
              <td>{run.rpe ?? ""}</td>
              <td>{run.tags?.join(", ")}</td>
              <td>
                <HStack gap={1}>
                  <Button size="xs" onClick={() => onEdit(run)}>
                    Edit
                  </Button>
                  <Button size="xs" onClick={() => deleteRun(run.id)}>
                    Delete
                  </Button>
                  <Button size="xs" onClick={() => duplicateRun(run.id)}>
                    Duplicate
                  </Button>
                </HStack>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
