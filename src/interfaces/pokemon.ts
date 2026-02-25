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

export interface ResponsePokemonList {
  data?: {
    pokemons: PokemonData[];
    count: number;
  };
  message?: string;
  error?: string;
}

export interface ResponsePokemonData {
  data?: PokemonData;
  message?: string;
  error?: string;
}
