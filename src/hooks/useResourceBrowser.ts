import { useCallback, useEffect, useRef, useState } from "react";
import { BrowseKey, useBrowseSnapshot } from "@context/BrowseSnapshotContext";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { PAGE_LIMIT } from "@constant/pagination";
import { SortKey, DEFAULT_SORT } from "@constant/sort";

type Status = "idle" | "loading" | "appending";

type QueryResult<T> = { results: T[]; total: number; hasMore: boolean };

// Opaque facet filters (e.g. { types: ["fire"], gens: ["1","3"] }). The hook
// forwards them to the endpoint blindly; each browser owns which facets exist.
type Filters = Record<string, string[]>;

async function fetchPage<T>(
  endpoint: string,
  query: string,
  sort: SortKey,
  filters: Filters,
  offset: number,
  signal: AbortSignal,
): Promise<QueryResult<T> | null> {
  const params = new URLSearchParams({
    q: query,
    sort,
    offset: String(offset),
    limit: String(PAGE_LIMIT),
  });
  for (const [key, values] of Object.entries(filters)) {
    if (values.length) params.set(key, values.join(","));
  }
  try {
    const res = await fetch(`${endpoint}?${params}`, { signal });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as QueryResult<T>;
  } catch (err) {
    if (signal.aborted) return null;
    throw err;
  }
}

export function useResourceBrowser<T>({
  initial,
  endpoint,
  snapshotKey,
}: {
  initial: QueryResult<T>;
  endpoint: string;
  snapshotKey: BrowseKey;
}) {
  const { snapshot, setSnapshot } = useBrowseSnapshot<T>(snapshotKey);

  const [query, setQuery] = useState(snapshot?.query ?? "");
  const [sort, setSort] = useState<SortKey>(snapshot?.sort ?? DEFAULT_SORT);
  const [filters, setFilters] = useState<Filters>(snapshot?.filters ?? {});
  const [results, setResults] = useState<T[]>(
    snapshot?.results ?? initial.results,
  );
  const [total, setTotal] = useState(snapshot?.total ?? initial.total);
  const [hasMore, setHasMore] = useState(snapshot?.hasMore ?? initial.hasMore);
  const [status, setStatus] = useState<Status>("idle");

  const search = useDebouncedValue(query, 250).trim().toLowerCase();

  // Reset to page 0 when the query, sort, or filters change. Old rows stay put
  // (dimmed by the view) until the new page lands, then swap. Skipped on mount,
  // where the seed/snapshot already matches.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    fetchPage<T>(endpoint, search, sort, filters, 0, controller.signal)
      .then((page) => {
        if (!page) return;
        setResults(page.results);
        setTotal(page.total);
        setHasMore(page.hasMore);
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
    return () => controller.abort();
  }, [search, sort, filters, endpoint]);

  const live = useRef({
    status,
    hasMore,
    count: results.length,
    search,
    sort,
    filters,
  });
  useEffect(() => {
    live.current = {
      status,
      hasMore,
      count: results.length,
      search,
      sort,
      filters,
    };
  }, [status, hasMore, results.length, search, sort, filters]);

  const onIntersect = useCallback(
    (intersecting: boolean) => {
      if (!intersecting) return;
      const { status, hasMore, count, search, sort, filters } = live.current;
      if (status !== "idle" || !hasMore) return;

      const controller = new AbortController();
      setStatus("appending");
      fetchPage<T>(endpoint, search, sort, filters, count, controller.signal)
        .then((page) => {
          if (!page) return;
          const now = live.current;
          // list changed under us
          if (
            now.search !== search ||
            now.sort !== sort ||
            now.filters !== filters
          )
            return;
          setResults((prev) => [...prev, ...page.results]);
          setTotal(page.total);
          setHasMore(page.hasMore);
          setStatus("idle");
        })
        .catch(() => setStatus("idle"));
    },
    [endpoint],
  );

  useEffect(() => {
    setSnapshot({ query, sort, filters, results, total, hasMore });
  }, [query, sort, filters, results, total, hasMore, setSnapshot]);

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
    filters,
    setFilters,
    rows: results,
    resultCount: total,
    isLast: !hasMore,
    isEmpty: results.length === 0,
    isLoading: status === "loading",
    isAppending: status === "appending",
    onIntersect,
  };
}
