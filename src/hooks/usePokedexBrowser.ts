import { useEffect, useMemo, useRef, useState } from "react";
import { PokemonData } from "@dex/interfaces/pokemon";
import { PokemonIndexEntry } from "@dex/lib/pokemon";
import { usePokemonList } from "@dex/context/PokemonListContext";
import { useDebouncedValue } from "@dex/hooks/useDebouncedValue";
import { dexNo } from "@dex/constant/pokemonMeta";
import { SortKey } from "@dex/components/home/ControlDeck";

export const PAGE_LIMIT = 12;

type UsePokedexBrowserArgs = {
  results: PokemonData[];
  index: PokemonIndexEntry[];
};

// The Nextdex "browser engine": search + sort over the full-dex index, with
// the row list windowed and its details lazy-loaded as you scroll. The model is
// simply "ensure the visible window's details are loaded, then render the
// loaded ones" — so re-sorting just loads whatever the new window needs, and a
// failed fetch leaves a row missing (retried later) rather than skipped.
export function usePokedexBrowser({ results, index }: UsePokedexBrowserArgs) {
  const { details, setDetails, count, setCount } = usePokemonList();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("number");
  const [searchCount, setSearchCount] = useState(PAGE_LIMIT);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);
  const searchActive = debouncedQuery.trim() !== "";

  // Everything we can render: the SSG first page merged with anything fetched on
  // scroll. Merging `results` means the first page never needs refetching.
  const detailsByName = useMemo(() => {
    const map: Record<string, PokemonData> = {};
    results.forEach((p) => (map[p.name] = p));
    return { ...map, ...details };
  }, [results, details]);

  // The whole dex, filtered by the query and sorted.
  const orderedIndex = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const matched = q
      ? index.filter(
          (e) => e.name.includes(q) || dexNo(e.id).includes(q),
        )
      : index;
    return [...matched].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : a.id - b.id,
    );
  }, [index, debouncedQuery, sort]);

  // How many entries to show. Browse depth lives in context (so it survives
  // home↔detail navigation); search gets its own window, so clearing the query
  // restores the browse depth.
  const visibleCount = searchActive ? searchCount : Math.max(count, PAGE_LIMIT);
  const visibleEntries = useMemo(
    () => orderedIndex.slice(0, visibleCount),
    [orderedIndex, visibleCount],
  );
  const isLast = visibleCount >= orderedIndex.length;

  // A new query restarts the search window (the browse window is left alone).
  useEffect(() => {
    setSearchCount(PAGE_LIMIT);
  }, [debouncedQuery]);

  // Changing the sort re-orders the whole list, so collapse both windows back to
  // one page (otherwise a carried-over depth would re-fetch hundreds of rows in
  // the new order). Ref-guarded so it skips mount and keeps a restored depth on
  // back-navigation.
  const prevSort = useRef(sort);
  useEffect(() => {
    if (prevSort.current === sort) return;
    prevSort.current = sort;
    setCount(PAGE_LIMIT);
    setSearchCount(PAGE_LIMIT);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sort, setCount]);

  // Load details for visible rows we don't have yet (capped per pass so a deep
  // re-sort fills progressively instead of firing hundreds of requests at once).
  useEffect(() => {
    const missing = visibleEntries
      .filter((e) => !detailsByName[e.name])
      .map((e) => e.name)
      .slice(0, PAGE_LIMIT);
    if (missing.length === 0) {
      setIsFetching(false);
      return;
    }

    let cancelled = false;
    setIsFetching(true);
    (async () => {
      const fetched = await Promise.all(
        missing.map(async (name) => {
          const resp = await fetch(`/api/pokemon/${name}`);
          if (!resp.ok) return null;
          const { data } = await resp.json();
          return data as PokemonData;
        }),
      );
      if (cancelled) return;
      setDetails((prev) => {
        let changed = false;
        const next = { ...prev };
        fetched.forEach((p) => {
          if (p && !next[p.name]) {
            next[p.name] = p;
            changed = true;
          }
        });
        return changed ? next : prev; // same ref when nothing new → no retry loop
      });
      setIsFetching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visibleEntries, detailsByName, setDetails]);

  // Reveal exactly one more page per intersection: consume the flag so the
  // window doesn't keep growing while the sentinel sits in view (which would
  // load many batches at once). It re-fires when the sentinel re-enters.
  useEffect(() => {
    if (!isIntersecting || isFetching || isLast) return;
    setIsIntersecting(false);
    if (searchActive) setSearchCount((c) => c + PAGE_LIMIT);
    else setCount((c) => Math.max(c, PAGE_LIMIT) + PAGE_LIMIT);
  }, [isIntersecting, isFetching, isLast, searchActive, setCount]);

  // Every visible row, with its details if loaded yet (null → render a skeleton
  // while it loads). The window only grows a page at a time, so the pending rows
  // are the batch currently being fetched.
  const rows = useMemo(
    () =>
      visibleEntries.map((e) => ({
        id: e.id,
        name: e.name,
        data: detailsByName[e.name] ?? null,
      })),
    [visibleEntries, detailsByName],
  );

  return {
    query,
    setQuery,
    sort,
    setSort,
    rows,
    resultCount: orderedIndex.length,
    isLast,
    isEmpty: orderedIndex.length === 0,
    onIntersect: setIsIntersecting,
  };
}
