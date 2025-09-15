import {
  Box,
  Button,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRuns, type RunEntry } from "@/store/runs";
import AddEditRunForm from "@/components/AddEditRunForm";
import { formatDuration } from "@/lib/time";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const day = (first.getDay() + 6) % 7; // Monday=0
  const start = new Date(year, month, 1 - day);
  return start;
}

export default function CalendarView() {
  const { runs, updateRun } = useRuns();
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const go = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const start = startOfCalendar(cursor.getFullYear(), cursor.getMonth());
  const days: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const byDate = runs.reduce<Record<string, RunEntry[]>>((acc, r) => {
    const key = r.date;
    (acc[key] ||= []).push(r);
    return acc;
  }, {});

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between">
        <HStack gap={2}>
          <Button onClick={() => go(-1)}>Prev</Button>
          <Text fontWeight="bold">
            {cursor.toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <Button onClick={() => go(1)}>Next</Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={7} gap={2}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <Box key={d} fontWeight="bold" textAlign="center">
            {d}
          </Box>
        ))}
        {days.map((d) => {
          const k = ymd(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const dayRuns = byDate[k] ?? [];
          const planned = dayRuns.filter((r) => r.status === "planned");
          const done = dayRuns.filter((r) => r.status !== "planned");
          return (
            <Box
              key={k}
              borderWidth="1px"
              borderRadius="md"
              p={2}
              bg={inMonth ? "white" : "gray.50"}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color="gray.600">
                  {d.getDate()}
                </Text>
                <Button
                  size="xs"
                  onClick={() => {
                    setSelectedDate(k);
                    setOpen(true);
                  }}
                >
                  Plan +
                </Button>
              </HStack>
              {planned.length > 0 && (
                <Box mb={1}>
                  <Text fontSize="xs" color="purple.600">
                    Planned
                  </Text>
                  {planned.map((r) => (
                    <HStack key={r.id} fontSize="xs" justify="space-between">
                      <Text>
                        {r.distanceKm.toFixed(1)} km •{" "}
                        {formatDuration(r.durationSec)} • {r.type}
                      </Text>
                      <Button
                        size="2xs"
                        onClick={() => updateRun({ ...r, status: "done" })}
                      >
                        Done
                      </Button>
                    </HStack>
                  ))}
                </Box>
              )}
              {done.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="green.600">
                    Completed
                  </Text>
                  {done.map((r) => (
                    <HStack key={r.id} fontSize="xs" justify="space-between">
                      <Text>
                        {r.distanceKm.toFixed(1)} km •{" "}
                        {formatDuration(r.durationSec)} • {r.type}
                      </Text>
                      <Button
                        size="2xs"
                        variant="outline"
                        onClick={() => updateRun({ ...r, status: "planned" })}
                      >
                        Plan
                      </Button>
                    </HStack>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </SimpleGrid>

      <AddEditRunForm
        isOpen={open}
        onClose={() => setOpen(false)}
        initialDate={selectedDate}
        defaultStatus="planned"
      />
    </VStack>
  );
}
