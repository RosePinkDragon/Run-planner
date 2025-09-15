import { SimpleGrid, Box } from "@chakra-ui/react";
import type { RunEntry } from "@/store/runs";
import { sumDistance, sumDuration, avgPace } from "@/lib/calc";
import { formatDuration, formatPace } from "@/lib/time";

interface Props {
  runs: RunEntry[];
}

export default function StatsCards({ runs }: Props) {
  const now = new Date();
  const weekStart = new Date(now);
  const diff = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - diff);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekRuns = runs.filter((r) => new Date(r.date) >= weekStart);
  const monthRuns = runs.filter((r) => new Date(r.date) >= monthStart);

  const weekKm = sumDistance(weekRuns).toFixed(2);
  const weekDur = formatDuration(sumDuration(weekRuns));
  const weekPace = formatPace(avgPace(weekRuns));

  const monthKm = sumDistance(monthRuns).toFixed(2);
  const monthDur = formatDuration(sumDuration(monthRuns));
  const monthPace = formatPace(avgPace(monthRuns));

  const allKm = sumDistance(runs).toFixed(2);
  const longest = Math.max(0, ...runs.map((r) => r.distanceKm)).toFixed(2);
  const count = runs.length;

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={4}>
      <Box borderWidth="1px" borderRadius="md" p={4}>
        <strong>This Week</strong>
        <br />
        {weekKm} km / {weekDur} / {weekPace}
      </Box>
      <Box borderWidth="1px" borderRadius="md" p={4}>
        <strong>This Month</strong>
        <br />
        {monthKm} km / {monthDur} / {monthPace}
      </Box>
      <Box borderWidth="1px" borderRadius="md" p={4}>
        <strong>All Time</strong>
        <br />
        {allKm} km / longest {longest} km / {count} runs
      </Box>
    </SimpleGrid>
  );
}
