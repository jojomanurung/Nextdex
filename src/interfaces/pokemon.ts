export interface ResponseBase {
  message?: string;
  error?: string;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonData {
  id: number;
  name: string;
  image: string;
  types: Array<string>;
  stats: Array<PokemonStat>;
  height: number;
  weight: number;
}

export interface ResponsePokemonData extends ResponseBase {
  data?: PokemonData;
}

export interface ResponsePokemonList extends ResponseBase {
  data?: Array<PokemonData>;
  count?: number;
}
