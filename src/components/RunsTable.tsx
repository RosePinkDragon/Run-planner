import { Button, HStack, Table, Badge } from "@chakra-ui/react";
import type { RunEntry } from "@/store/runs";
import { useRuns } from "@/store/runs";
import { formatDuration, formatPace } from "@/lib/time";
import { useState } from "react";

interface Props {
  runs: RunEntry[];
  onEdit: (run: RunEntry) => void;
}

export default function RunsTable({ runs, onEdit }: Props) {
  const { deleteRun, duplicateRun, updateRun } = useRuns();
  const [sort, setSort] = useState<{
    key: "date" | "distance" | "duration";
    dir: 1 | -1;
  }>();

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

  const header = (
    label: string,
    key: "date" | "distance" | "duration",
    opts?: { align?: "start" | "end" }
  ) => {
    const isActive = sort?.key === key;
    const arrow = isActive ? (sort!.dir === 1 ? "▲" : "▼") : "";
    const ariaSort: "none" | "ascending" | "descending" = isActive
      ? sort!.dir === 1
        ? "ascending"
        : "descending"
      : "none";

    return (
      <Table.ColumnHeader
        onClick={() => toggleSort(key)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSort(key);
          }
        }}
        tabIndex={0}
        aria-sort={ariaSort}
        cursor="pointer"
        userSelect="none"
        textAlign={opts?.align === "end" ? "end" : undefined}
      >
        {label} {arrow}
      </Table.ColumnHeader>
    );
  };

  return (
    <Table.ScrollArea borderWidth="1px" rounded="md" width="full">
      <Table.Root size="sm" variant="outline" striped stickyHeader interactive>
        <Table.Header>
          <Table.Row>
            {header("Date", "date")}
            {header("Distance (km)", "distance", { align: "end" })}
            {header("Duration", "duration", { align: "end" })}
            <Table.ColumnHeader textAlign="end">Pace</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>Effort</Table.ColumnHeader>
            <Table.ColumnHeader>Tags</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((run) => (
            <Table.Row key={run.id}>
              <Table.Cell>{run.date}</Table.Cell>
              <Table.Cell textAlign="end">
                {run.distanceKm.toFixed(2)}
              </Table.Cell>
              <Table.Cell textAlign="end">
                {formatDuration(run.durationSec)}
              </Table.Cell>
              <Table.Cell textAlign="end">
                {formatPace(run.paceSecPerKm)}
              </Table.Cell>
              <Table.Cell>{run.type}</Table.Cell>
              <Table.Cell>{run.rpe ?? ""}</Table.Cell>
              <Table.Cell>{run.tags?.join(", ")}</Table.Cell>
              <Table.Cell>
                {run.status === "planned" ? (
                  <Badge colorPalette="purple">Planned</Badge>
                ) : (
                  <Badge colorPalette="green">Done</Badge>
                )}
              </Table.Cell>
              <Table.Cell textAlign="end">
                <HStack gap={1} justify="flex-end">
                  <Button size="xs" onClick={() => onEdit(run)}>
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    onClick={() =>
                      updateRun({
                        ...run,
                        status: run.status === "planned" ? "done" : "planned",
                      })
                    }
                  >
                    {run.status === "planned"
                      ? "Mark Completed"
                      : "Mark Planned"}
                  </Button>
                  <Button size="xs" onClick={() => deleteRun(run.id)}>
                    Delete
                  </Button>
                  <Button size="xs" onClick={() => duplicateRun(run.id)}>
                    Duplicate
                  </Button>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
