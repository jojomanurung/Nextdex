import { SortKey } from "@constant/sort";

export interface AbilityData {
  id: number;
  name: string;
  generation: number; // 1–9 (0 if unknown)
  effect: string; // cleaned short_effect (fallback: effect)
}

export interface AbilityIndexEntry {
  id: number;
  name: string;
}

export interface AbilityQuery {
  query?: string;
  sort?: SortKey;
  offset?: number;
  limit?: number;
  gens?: number[];
}

export interface AbilityQueryResult {
  results: AbilityData[];
  total: number;
  hasMore: boolean;
}

export interface AbilityPokemonRef {
  id: number;
  name: string;
  image: string;
  isHidden: boolean;
}

export interface AbilityDetailData extends AbilityData {
  description: string; // cleaned full effect (fallback: short_effect)
  pokemon: AbilityPokemonRef[]; // id < 10000 only, sorted by id
}
