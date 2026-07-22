import { create } from "zustand";
import { SortKey } from "@constant/sort";

export type BrowseKey = "pokemon" | "abilities";

// Opaque facet filters (e.g. { types: ["fire"], gens: ["1","3"] }).
export type Filters = Record<string, string[]>;

export type Status = "idle" | "loading" | "appending";

// The full list state for one browse family, keyed by BrowseKey. Living in a
// module-scoped store, it survives list ↔ detail navigation for the session and
// resets on a full refresh — the job the old BrowseSnapshotContext did, minus
// the provider and the hook's duplicate useState.
export type BrowserState<T> = {
  query: string;
  sort: SortKey;
  filters: Filters;
  results: T[];
  total: number;
  hasMore: boolean;
  status: Status;
  loadedKey: string; // signature of the currently-loaded query
};

type Slices = Partial<Record<BrowseKey, BrowserState<unknown>>>;

type BrowseStore = {
  slices: Slices;
  seed: (key: BrowseKey, slice: BrowserState<unknown>) => void;
  patch: (
    key: BrowseKey,
    partial:
      | Partial<BrowserState<unknown>>
      | ((prev: BrowserState<unknown>) => Partial<BrowserState<unknown>>),
  ) => void;
};

export const useBrowseStore = create<BrowseStore>((set) => ({
  slices: {},
  // Idempotent: first mount seeds from the SSR `initial`; a back-nav remount
  // finds the slice already present and leaves it untouched.
  seed: (key, slice) =>
    set((state) =>
      state.slices[key] ? state : { slices: { ...state.slices, [key]: slice } },
    ),
  patch: (key, partial) =>
    set((state) => {
      const prev = state.slices[key];
      if (!prev) return state;
      const next = typeof partial === "function" ? partial(prev) : partial;
      return { slices: { ...state.slices, [key]: { ...prev, ...next } } };
    }),
}));
