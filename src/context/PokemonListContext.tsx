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
  // How many entries of the browse list are revealed. Kept here (not in the
  // browser hook) so the depth — and thus the list you return to when a search
  // is cleared — survives home↔detail navigation for the whole session.
  browseCount: number;
  setBrowseCount: Dispatch<SetStateAction<number>>;
};

const PokemonListContext = createContext<PokemonListState | undefined>(
  undefined,
);

// Lives in _app.tsx, so the detail cache + scroll depth survive page navigation
// (home <-> detail) for the whole client session. A full browser refresh starts
// fresh.
export function PokemonListProvider({ children }: { children: ReactNode }) {
  const [details, setDetails] = useState<Record<string, PokemonData>>({});
  const [browseCount, setBrowseCount] = useState(0);

  return (
    <PokemonListContext.Provider
      value={{ details, setDetails, browseCount, setBrowseCount }}
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
