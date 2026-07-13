import { SortKey } from "@dex/constant/sort";

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonData {
  id: number;
  name: string;
  image: string;
  types: string[];
  stats: PokemonStat[];
  height: number;
  weight: number;
}

// --- List / query ---
// Shapes for the list pipeline and the lightweight id+name dex index.

export interface PokemonIndexEntry {
  id: number;
  name: string;
}

export interface PokemonQuery {
  query?: string;
  sort?: SortKey;
  offset?: number;
  limit?: number;
}

export interface PokemonQueryResult {
  results: PokemonData[];
  total: number;
  hasMore: boolean;
}

export interface PokemonNeighbors {
  prev: PokemonIndexEntry | null;
  next: PokemonIndexEntry | null;
}

// --- Detail page only ---
// Richer shape returned by getPokemonDetail. The list path stays on the lean
// PokemonData above; these extra fields come from the species, evolution-chain,
// ability, and type endpoints and are only fetched for a single detail page.

export interface AbilityInfo {
  name: string;
  isHidden: boolean;
  /** English short_effect, cleaned of newlines. */
  effect: string;
}

export interface EvolutionStage {
  id: number;
  name: string;
  image: string;
  /** Depth in the chain: 0 = base form, 1 = first evolution, etc. Lets the UI
   *  lay branched lines (e.g. Eevee) out as one column per stage. */
  stage: number;
  /** How this stage is reached from the previous one ("Lv. 16", "Thunder
   *  Stone", "Trade"…); null for the base form. */
  condition: string | null;
}

export interface TypeMatchup {
  type: string;
  /** Defensive multiplier vs. this attacking type: 0, 0.25, 0.5, 2, or 4
   *  (neutral 1× matchups are omitted). */
  multiplier: number;
}

export interface FlavorEntry {
  generation: number; // 1–9
  generationLabel: string; // "Gen III · Hoenn"
  version: string; // representative game, prettified e.g. "Crystal"
  text: string; // cleaned English Pokédex entry
}

export interface SpeciesMeta {
  genus: string; // e.g. "Mouse Pokémon"
  flavorEntries: FlavorEntry[]; // one per generation, newest first
  habitat: string | null;
  captureRate: number; // 0–255 (higher = easier)
  baseHappiness: number; // 0–255
  genderRatio: string; // formatted label, e.g. "♀ 12.5%  ♂ 87.5%"
  eggGroups: string[];
  growthRate: string;
  isLegendary: boolean;
  isMythical: boolean;
  isBaby: boolean;
}

export interface PokemonDetailData extends PokemonData {
  shinyImage: string;
  abilities: AbilityInfo[];
  evolution: EvolutionStage[];
  matchups: TypeMatchup[];
  species: SpeciesMeta;
}
