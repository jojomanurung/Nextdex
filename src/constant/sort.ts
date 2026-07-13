export type SortKey = "number" | "reverseNum" | "name" | "reverseName";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "reverseNum", label: "Reverse Number" },
  { value: "name", label: "Name (A–Z)" },
  { value: "reverseName", label: "Name (Z–A)" },
];

export const DEFAULT_SORT: SortKey = "number";

export function isSortKey(value: string): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value);
}
