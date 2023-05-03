import { Pokemon, PokemonClient } from "pokenode-ts";
import { useCallback, useRef, useState } from "react";

export interface InfiniteScroll {
  isLoading: boolean;
  loadMoreCallback: (el: HTMLDivElement) => void;
  hasDynamicPokemon: boolean;
  dynamicPokemon: Pokemon[];
  isLastPage: boolean;
}

export const InfiniteScroll = (pokemon: Pokemon[]): InfiniteScroll => {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(9);
  const [hasDynamicPokemon, setHasDynamicPokemon] = useState(false);
  const [dynamicPokemon, setDynamicPokemon] = useState<Pokemon[]>(pokemon);
  const [isLastPage, setIsLastPage] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreTimeout: NodeJS.Timeout = setTimeout(() => null, 500);
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout>(loadMoreTimeout);

  const handleObserver = useCallback(
    (entries: any[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setIsLoading(true);
        clearTimeout(loadMoreTimeoutRef.current);

        // this timeout debounces the intersection events
        loadMoreTimeoutRef.current = setTimeout(() => {
          const api = new PokemonClient();

          api.listPokemons(page, 9).then(async (next) => {
            console.log('page? ==> ', next.next);
            setPage(page + 9);
            const promises = next.results.map((result) =>
              api.getPokemonByName(result.name)
            );
            const pokeList = await Promise.all(promises);
            const response = { ...next, results: pokeList };
            if (response.results.length) {
              const newDynamicPokemon = [...dynamicPokemon, ...pokeList];
              console.log('new list', newDynamicPokemon);
              setDynamicPokemon(newDynamicPokemon);
              setIsLastPage(newDynamicPokemon?.length === response?.count);
              setHasDynamicPokemon(true);
              setIsLoading(false);
            }
          });
        }, 500);
      }
    },
    [loadMoreTimeoutRef, setIsLoading, page, dynamicPokemon]
  );

  const loadMoreCallback = useCallback(
    (el: HTMLDivElement) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      const option: IntersectionObserverInit = {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      };
      observerRef.current = new IntersectionObserver(handleObserver, option);

      if (el) observerRef.current.observe(el);
    },
    [handleObserver, isLoading]
  );

  return {
    isLoading,
    loadMoreCallback,
    hasDynamicPokemon,
    dynamicPokemon,
    isLastPage,
  };
};
