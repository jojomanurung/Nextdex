"use client";

import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { PokemonData } from "@interfaces/pokemon";
import { SortKey } from "@constant/sort";

// Snapshot of the browse list, lifted into the never-unmounting root layout so
// home ↔ detail navigation restores the full scrolled list for the session.
export type BrowserSnapshot = {
  query: string;
  sort: SortKey;
  results: PokemonData[];
  total: number;
  hasMore: boolean;
};

type PokemonListState = {
  snapshot: BrowserSnapshot | null;
  setSnapshot: Dispatch<SetStateAction<BrowserSnapshot | null>>;
};

const PokemonListContext = createContext<PokemonListState | undefined>(
  undefined,
);

export function PokemonListProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<BrowserSnapshot | null>(null);

  return (
    <PokemonListContext.Provider value={{ snapshot, setSnapshot }}>
      {children}
    </PokemonListContext.Provider>
  );
}

export function usePokemonList() {
  const ctx = useContext(PokemonListContext);
  if (!ctx) {
    throw new Error("usePokemonList must be used within a PokemonListProvider");
  }
  return ctx;
}
