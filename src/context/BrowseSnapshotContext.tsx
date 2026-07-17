"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { SortKey } from "@constant/sort";

export type BrowseKey = "pokemon" | "abilities";

// Snapshot of a browse list, lifted into the never-unmounting root layout so
// list ↔ detail navigation restores the full scrolled list for the session.
export type BrowserSnapshot<T> = {
  query: string;
  sort: SortKey;
  filters: Record<string, string[]>;
  results: T[];
  total: number;
  hasMore: boolean;
};

type SnapshotStore = Partial<Record<BrowseKey, BrowserSnapshot<unknown>>>;

type BrowseSnapshotState = {
  store: SnapshotStore;
  setSnapshotFor: (key: BrowseKey, snapshot: BrowserSnapshot<unknown>) => void;
};

const BrowseSnapshotContext = createContext<BrowseSnapshotState | undefined>(
  undefined,
);

export function BrowseSnapshotProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<SnapshotStore>({});

  const setSnapshotFor = useCallback(
    (key: BrowseKey, snapshot: BrowserSnapshot<unknown>) => {
      setStore((prev) => ({ ...prev, [key]: snapshot }));
    },
    [],
  );

  return (
    <BrowseSnapshotContext.Provider value={{ store, setSnapshotFor }}>
      {children}
    </BrowseSnapshotContext.Provider>
  );
}

export function useBrowseSnapshot<T>(key: BrowseKey) {
  const ctx = useContext(BrowseSnapshotContext);
  if (!ctx) {
    throw new Error(
      "useBrowseSnapshot must be used within a BrowseSnapshotProvider",
    );
  }
  const { store, setSnapshotFor } = ctx;
  const snapshot = (store[key] ?? null) as BrowserSnapshot<T> | null;
  const setSnapshot = useCallback(
    (next: BrowserSnapshot<T>) =>
      setSnapshotFor(key, next as BrowserSnapshot<unknown>),
    [key, setSnapshotFor],
  );
  return { snapshot, setSnapshot };
}
