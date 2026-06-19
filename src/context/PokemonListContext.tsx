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
  pokemons: PokemonData[];
  setPokemons: Dispatch<SetStateAction<PokemonData[]>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  isLast: boolean;
  setIsLast: Dispatch<SetStateAction<boolean>>;
};

const PokemonListContext = createContext<PokemonListState | undefined>(
  undefined,
);

// Lives in _app.tsx, so the list state survives page navigation (home <-> detail)
// for the whole client session. A full browser refresh starts fresh.
export function PokemonListProvider({ children }: { children: ReactNode }) {
  const [pokemons, setPokemons] = useState<PokemonData[]>([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);

  return (
    <PokemonListContext.Provider
      value={{ pokemons, setPokemons, page, setPage, isLast, setIsLast }}
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
