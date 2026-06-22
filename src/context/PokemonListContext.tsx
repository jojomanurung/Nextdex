import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { PokemonData } from "@dex/interfaces/pokemon";

type PokemonListState = {
  // Detail cache keyed by name — populated lazily as rows scroll into view, so
  // returning from a detail page doesn't refetch what was already shown.
  details: Record<string, PokemonData>;
  setDetails: Dispatch<SetStateAction<Record<string, PokemonData>>>;
  // How many entries of the (filtered/sorted) index are currently shown.
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
};

const PokemonListContext = createContext<PokemonListState | undefined>(
  undefined,
);

// Lives in _app.tsx, so the detail cache + scroll depth survive page navigation
// (home <-> detail) for the whole client session. A full browser refresh starts
// fresh.
export function PokemonListProvider({ children }: { children: ReactNode }) {
  const [details, setDetails] = useState<Record<string, PokemonData>>({});
  const [count, setCount] = useState(0);

  return (
    <PokemonListContext.Provider
      value={{ details, setDetails, count, setCount }}
    >
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
