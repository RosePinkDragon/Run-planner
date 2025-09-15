import {
  Box,
  Button,
  HStack,
  Input,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  Stack,
  Textarea,
  type SliderValueChangeDetails,
  createListCollection,
  Select,
} from "@chakra-ui/react";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerCloseTrigger,
} from "@/components/ui/drawer";
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
  initialDate?: string;
  defaultStatus?: "planned" | "done";
}
export default function AddEditRunForm({
  isOpen,
  onClose,
  initialRun,
  initialDate,
  defaultStatus,
}: Props) {
  const { addRun, updateRun, deleteRun, duplicateRun } = useRuns();
  const isEdit = !!initialRun;

  const typeCollection = createListCollection({
    items: typeOptions.map((t) => ({ label: t, value: t })),
  });

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
      setDate(initialDate ?? new Date().toISOString().slice(0, 10));
      setDistance(0);
      setDuration("00:00:00");
      setType("Easy");
      setRpe(undefined);
      setTags("");
      setNotes("");
    }
  }, [initialRun, isOpen, initialDate]);

  // Keep the drawer mounted to allow exit animations; control visibility via `open` prop.

  const durationSec = parseDuration(duration);
  const pace = formatPace(distance > 0 ? durationSec / distance : 0);

  const handleSave = () => {
    const runBase = {
      date,
      distanceKm: distance,
      durationSec,
      type,
      rpe,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes,
      status: initialRun?.status ?? defaultStatus,
    };
    if (isEdit && initialRun) {
      updateRun({ ...runBase, id: initialRun.id });
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
    <DrawerRoot
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="end"
      size="md"
    >
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? "Edit Run" : "Add Run"}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Stack gap={4}>
            <Box>
              <label>Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Box>
            <Box>
              <label>Distance (km)</label>
              <Input
                type="number"
                step="0.01"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
              />
            </Box>
            <Box>
              <label>Duration (hh:mm:ss)</label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Box>
            <Box>
              <label>Pace (mm:ss/km)</label>
              <Input value={pace} readOnly />
            </Box>
            <Box>
              <label>Type</label>
              <Select.Root
                collection={typeCollection}
                value={[type]}
                onValueChange={(e) =>
                  setType((e.value[0] as RunType) ?? "Easy")
                }
                positioning={{
                  strategy: "fixed",
                  hideWhenDetached: true,
                  sameWidth: true,
                }}
              >
                <Select.HiddenSelect />
                <Select.Control w="full">
                  <Select.Trigger w="full">
                    <Select.ValueText placeholder="Select type" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {typeCollection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
            <Box>
              <label htmlFor="rpe">Effort (RPE 1-10)</label>
              <SliderRoot
                id="rpe"
                min={1}
                max={10}
                value={[rpe ?? 5]}
                onValueChange={(d: SliderValueChangeDetails) =>
                  setRpe(d.value[0])
                }
              >
                <SliderTrack>
                  <SliderRange />
                </SliderTrack>
                <SliderThumb index={0} />
              </SliderRoot>
            </Box>
            <Box>
              <label>Tags</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </Box>
            <Box>
              <label>Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <HStack gap={3} w="full" justify="flex-end">
            {isEdit && initialRun && (
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            )}
            {isEdit && initialRun && (
              <Button onClick={handleDuplicate}>Duplicate</Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button colorPalette="blue" onClick={handleSave}>
              {isEdit ? "Update" : "Save"}
            </Button>
          </HStack>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  );
}
