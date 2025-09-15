import {
  HStack,
  Button,
  Box,
  Input,
  createListCollection,
  Select,
  Portal,
  Field,
} from "@chakra-ui/react";
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

  const typeCollection = createListCollection({
    items: [
      { label: "All", value: "" },
      ...typeOptions.map((t) => ({ label: t, value: t })),
    ],
  });

  const update = (patch: Partial<Filters>) => {
    const next = { ...state, ...patch };
    setState(next);
    onChange(next);
  };

  return (
    <HStack gap={4} flexWrap="wrap" mb={4}>
      <Box>
        <Select.Root
          width={150}
          collection={typeCollection}
          value={[state.type || ""]}
          onValueChange={(e) =>
            update({
              type: ((e.value[0] as string) || undefined) as
                | RunType
                | undefined,
            })
          }
        >
          <Select.HiddenSelect />
          <Select.Label>Type</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="All" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
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
          </Portal>
        </Select.Root>
      </Box>
      <Box>
        <Field.Root>
          <Field.Label>From</Field.Label>
          <Input
            type="date"
            value={state.from || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update({ from: e.target.value || undefined })
            }
          />
        </Field.Root>
      </Box>
      <Box>
        <Field.Root>
          {" "}
          <Field.Label>To</Field.Label>
          <Input
            type="date"
            value={state.to || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update({ to: e.target.value || undefined })
            }
          />
        </Field.Root>
      </Box>
      <Box flex="1">
        <Field.Root>
          {" "}
          <Field.Label>Search</Field.Label>
          <Input
            placeholder="Tags or notes"
            value={state.text || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update({ text: e.target.value || undefined })
            }
          />
        </Field.Root>
      </Box>
      <Box>
        <Button marginTop={6} onClick={onClear}>
          Clear
        </Button>
      </Box>
    </HStack>
  );
}
