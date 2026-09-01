import { SortKey } from "@constant/sort";
import { FlavorEntry, TypeMatchup } from "@interfaces/pokemon";

export interface MoveData {
  id: number;
  name: string;
  type: string; // elemental type, e.g. "fire"
  damageClass: string; // physical | special | status (or "" if unknown)
  generation: number; // 1–9 (0 if unknown)
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number; // -8…8
  shortEffect: string; // cleaned short_effect, $effect_chance interpolated
}

export interface MoveIndexEntry {
  id: number;
  name: string;
}

export interface MoveQuery {
  query?: string;
  sort?: SortKey;
  offset?: number;
  limit?: number;
  types?: string[];
  classes?: string[];
  gens?: number[];
}

export interface MoveQueryResult {
  results: MoveData[];
  total: number;
  hasMore: boolean;
}

export interface MoveLearner {
  id: number;
  name: string;
  image: string; // official artwork from the id
}

export interface MoveDetailData extends MoveData {
  effect: string; // cleaned full effect, $effect_chance interpolated
  effectChance: number | null;
  target: string; // e.g. "selected-pokemon"
  // meta (all optional in effect — zero/absent rows are dropped by the panel)
  ailment: string;
  category: string;
  critRate: number;
  drain: number; // + heal / − recoil, percent of damage
  healing: number; // percent of max HP
  minHits: number | null;
  maxHits: number | null;
  minTurns: number | null;
  maxTurns: number | null;
  ailmentChance: number;
  flinchChance: number;
  statChance: number;
  flavorEntries: FlavorEntry[]; // one per generation, newest first
  learners: MoveLearner[]; // id < 10000 only, sorted by id
  // Offensive type effectiveness (from the move type's damage_relations); empty
  // for status moves, which deal no damage. Sorted most-effective first.
  matchups: TypeMatchup[];
}
