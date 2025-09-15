import { HStack, Button, Box, Input } from "@chakra-ui/react";
import type { RunType } from "@/store/runs";
import { useState, useEffect } from "react";

export interface Filters {
  type?: RunType;
  from?: string;
  to?: string;
  text?: string;
}

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}

const typeOptions: RunType[] = [
  "Easy",
  "Tempo",
  "Intervals",
  "Hill",
  "Long",
  "Recovery",
  "Strength",
];

export default function FiltersBar({ value, onChange, onClear }: Props) {
  const [state, setState] = useState<Filters>(value);
  useEffect(() => setState(value), [value]);

  const update = (patch: Partial<Filters>) => {
    const next = { ...state, ...patch };
    setState(next);
    onChange(next);
  };

  return (
    <HStack gap={4} flexWrap="wrap" mb={4}>
      <Box>
        <label>Type</label>
        <select
          value={state.type || ""}
          onChange={(e) => update({ type: (e.target.value as RunType) || undefined })}
        >
          <option value="">All</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Box>
      <Box>
        <label>From</label>
        <Input
          type="date"
          value={state.from || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ from: e.target.value || undefined })
          }
        />
      </Box>
      <Box>
        <label>To</label>
        <Input
          type="date"
          value={state.to || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ to: e.target.value || undefined })
          }
        />
      </Box>
      <Box flex="1">
        <label>Search</label>
        <Input
          placeholder="Tags or notes"
          value={state.text || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ text: e.target.value || undefined })
          }
        />
      </Box>
      <Button onClick={onClear}>Clear</Button>
    </HStack>
  );
}
