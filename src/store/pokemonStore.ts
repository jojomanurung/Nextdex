import { PokemonData } from "@interfaces/pokemon";
import { createBrowseStore } from "@store/createBrowseStore";

export const usePokemonStore = createBrowseStore<PokemonData>("/api/pokemon");
