import { useCallback, useEffect, useRef, useState } from "react";
import { PokemonData, PokemonQueryResult } from "@interfaces/pokemon";
import { usePokemonList } from "@context/PokemonListContext";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { PAGE_LIMIT } from "@constant/pagination";
import { SortKey, DEFAULT_SORT } from "@constant/sort";

type Status = "idle" | "loading" | "appending";

async function fetchPage(
  query: string,
  sort: SortKey,
  offset: number,
  signal: AbortSignal,
): Promise<PokemonQueryResult | null> {
  const params = new URLSearchParams({
    q: query,
    sort,
    offset: String(offset),
    limit: String(PAGE_LIMIT),
  });
  try {
    const res = await fetch(`/api/pokemon?${params}`, { signal });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as PokemonQueryResult;
  } catch (err) {
    if (signal.aborted) return null;
    throw err;
  }
}

export function usePokedexBrowser({ initial }: { initial: PokemonQueryResult }) {
  const { snapshot, setSnapshot } = usePokemonList();

  const [query, setQuery] = useState(snapshot?.query ?? "");
  const [sort, setSort] = useState<SortKey>(snapshot?.sort ?? DEFAULT_SORT);
  const [results, setResults] = useState<PokemonData[]>(
    snapshot?.results ?? initial.results,
  );
  const [total, setTotal] = useState(snapshot?.total ?? initial.total);
  const [hasMore, setHasMore] = useState(snapshot?.hasMore ?? initial.hasMore);
  const [status, setStatus] = useState<Status>("idle");

  const search = useDebouncedValue(query, 250).trim().toLowerCase();

  // Reset to page 0 when the query or sort changes. Old rows stay put (dimmed by
  // the view) until the new page lands, then swap. Skipped on mount, where the
  // seed/snapshot already matches.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    fetchPage(search, sort, 0, controller.signal)
      .then((page) => {
        if (!page) return;
        setResults(page.results);
        setTotal(page.total);
        setHasMore(page.hasMore);
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
    return () => controller.abort();
  }, [search, sort]);

  // Latest values for the stable intersect callback.
  const live = useRef({ status, hasMore, count: results.length, search, sort });
  useEffect(() => {
    live.current = { status, hasMore, count: results.length, search, sort };
  }, [status, hasMore, results.length, search, sort]);

  const onIntersect = useCallback((intersecting: boolean) => {
    if (!intersecting) return;
    const { status, hasMore, count, search, sort } = live.current;
    if (status !== "idle" || !hasMore) return;

    const controller = new AbortController();
    setStatus("appending");
    fetchPage(search, sort, count, controller.signal)
      .then((page) => {
        if (!page) return;
        const now = live.current;
        if (now.search !== search || now.sort !== sort) return; // list changed under us
        setResults((prev) => [...prev, ...page.results]);
        setTotal(page.total);
        setHasMore(page.hasMore);
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
  }, []);

  useEffect(() => {
    setSnapshot({ query, sort, results, total, hasMore });
  }, [query, sort, results, total, hasMore, setSnapshot]);

  function changeSort(next: SortKey) {
    if (next === sort) return;
    setSort(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    query,
    setQuery,
    sort,
    setSort: changeSort,
    rows: results,
    resultCount: total,
    isLast: !hasMore,
    isEmpty: results.length === 0,
    isLoading: status === "loading",
    isAppending: status === "appending",
    onIntersect,
  };
}
