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