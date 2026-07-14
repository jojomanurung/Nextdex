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

// Comparators for the {id, name} browse indexes (Pokémon + ability). Kept here
// so both the server libs and the client hook share one dependency-free source.
export const SORT_COMPARATORS: Record<
  SortKey,
  (a: { id: number; name: string }, b: { id: number; name: string }) => number
> = {
  number: (a, b) => a.id - b.id,
  reverseNum: (a, b) => b.id - a.id,
  name: (a, b) => a.name.localeCompare(b.name),
  reverseName: (a, b) => b.name.localeCompare(a.name),
};
