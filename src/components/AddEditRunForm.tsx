import { Box, Button, HStack, Input, Stack, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRuns, type RunEntry, type RunType } from "@/store/runs";
import { parseDuration, formatDuration, formatPace } from "@/lib/time";

const typeOptions: RunType[] = [
  "Easy",
  "Tempo",
  "Intervals",
  "Hill",
  "Long",
  "Recovery",
  "Strength",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialRun?: RunEntry;
}

export default function AddEditRunForm({ isOpen, onClose, initialRun }: Props) {
  const { addRun, updateRun, deleteRun, duplicateRun } = useRuns();
  const isEdit = !!initialRun;

  const [date, setDate] = useState("");
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState("00:00:00");
  const [type, setType] = useState<RunType>("Easy");
  const [rpe, setRpe] = useState<number | undefined>();
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialRun) {
      setDate(initialRun.date);
      setDistance(initialRun.distanceKm);
      setDuration(formatDuration(initialRun.durationSec));
      setType(initialRun.type);
      setRpe(initialRun.rpe);
      setTags(initialRun.tags?.join(",") || "");
      setNotes(initialRun.notes || "");
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setDistance(0);
      setDuration("00:00:00");
      setType("Easy");
      setRpe(undefined);
      setTags("");
      setNotes("");
    }
  }, [initialRun, isOpen]);

  if (!isOpen) return null;

  const durationSec = parseDuration(duration);
  const pace = formatPace(distance > 0 ? durationSec / distance : 0);

  const handleSave = () => {
    const runBase = {
      date,
      distanceKm: distance,
      durationSec,
      type,
      rpe,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes,
    };
    if (isEdit && initialRun) {
      updateRun({ ...runBase, id: initialRun.id, paceSecPerKm: 0 });
    } else {
      addRun(runBase);
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialRun) {
      deleteRun(initialRun.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    if (initialRun) {
      duplicateRun(initialRun.id);
      onClose();
    }
  };

  return (
    <Box position="fixed" top={0} right={0} w={{ base: "100%", md: "400px" }} h="100%" bg="white" p={4} overflowY="auto" shadow="md" zIndex={10}>
      <Stack gap={4}>
        <HStack justify="space-between">
          <strong>{isEdit ? "Edit Run" : "Add Run"}</strong>
          <Button onClick={onClose}>Close</Button>
        </HStack>
        <Box>
          <label>Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Box>
        <Box>
          <label>Distance (km)</label>
          <Input type="number" step="0.01" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} />
        </Box>
        <Box>
          <label>Duration (hh:mm:ss)</label>
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Box>
        <Box>
          <label>Pace (mm:ss/km)</label>
          <Input value={pace} readOnly />
        </Box>
        <Box>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as RunType)}>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Box>
        <Box>
          <label>Effort (RPE 1-10)</label>
          <input type="range" min={1} max={10} value={rpe ?? 5} onChange={(e) => setRpe(parseInt(e.target.value))} />
        </Box>
        <Box>
          <label>Tags</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </Box>
        <Box>
          <label>Notes</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Box>
        <HStack gap={3}>
          {isEdit && initialRun && (
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          )}
          {isEdit && initialRun && <Button onClick={handleDuplicate}>Duplicate</Button>}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
