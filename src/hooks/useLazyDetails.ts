import { useEffect, useMemo, useState } from "react";
import { PokemonData } from "@dex/interfaces/pokemon";
import { usePokemonList } from "@dex/context/PokemonListContext";

// The index only carries id+name, so each visible row's full PokemonData is
// fetched on demand. We fetch at most this many per pass, so revealing a deep
// window (or re-sorting) fills progressively instead of firing hundreds of
// requests at once; later passes pick up the rest as the cache fills.
const FETCH_BATCH = 18;

async function fetchPokemon(name: string): Promise<PokemonData | null> {
  const res = await fetch(`/api/pokemon/${name}`);
  if (!res.ok) return null; // leave the row missing; a later pass retries it
  const { data } = await res.json();
  return data as PokemonData;
}

// Fold freshly fetched details into the cache, skipping failures (null) and
// names already present. Returns the SAME object when nothing new arrived, so a
// batch of all-failed fetches can't spin the loading effect into a retry loop.
function mergeFetched(
  cache: Record<string, PokemonData>,
  fetched: (PokemonData | null)[],
): Record<string, PokemonData> {
  let changed = false;
  const next = { ...cache };
  for (const p of fetched) {
    if (p && !next[p.name]) {
      next[p.name] = p;
      changed = true;
    }
  }
  return changed ? next : cache;
}

// Ensures the given names have their PokemonData loaded, fetching any misses in
// capped batches. `seed` (the SSG first page) is merged over the shared cache
// so those rows never refetch. Returns the lookup + whether a fetch is in
// flight (so the list can hold off growing until the current batch lands).
export function useLazyDetails(names: string[], seed: PokemonData[]) {
  const { details, setDetails } = usePokemonList();
  const [isFetching, setIsFetching] = useState(false);

  // Everything renderable: the seeded first page over the lazily-loaded cache.
  const byName = useMemo(() => {
    const map: Record<string, PokemonData> = {};
    seed.forEach((p) => (map[p.name] = p));
    return { ...map, ...details };
  }, [seed, details]);

  useEffect(() => {
    const missing = names.filter((name) => !byName[name]).slice(0, FETCH_BATCH);
    if (missing.length === 0) {
      setIsFetching(false);
      return;
    }

    let cancelled = false;
    setIsFetching(true);
    (async () => {
      const fetched = await Promise.all(missing.map(fetchPokemon));
      if (cancelled) return;
      setDetails((cache) => mergeFetched(cache, fetched));
      setIsFetching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [names, byName, setDetails]);

  return { byName, isFetching };
}
