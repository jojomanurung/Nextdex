import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { PAGE_LIMIT } from "@constant/pagination";
import { SortKey, DEFAULT_SORT } from "@constant/sort";
import {
  BrowseKey,
  BrowserState,
  Filters,
  useBrowseStore,
} from "@store/browseStore";

type QueryResult<T> = { results: T[]; total: number; hasMore: boolean };

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
  const patch = useBrowseStore((x) => x.patch);

  // The slice this browser seeds from — stable across renders. loadedKey matches
  // the mount queryKey so the reset effect no-ops on first render.
  const [seedSlice] = useState<BrowserState<unknown>>(() => ({
    query: "",
    sort: DEFAULT_SORT,
    filters: {},
    results: initial.results,
    total: initial.total,
    hasMore: initial.hasMore,
    status: "idle",
    loadedKey: `${endpoint}||${DEFAULT_SORT}|`,
  }));

  // Seed the store once (lazy, idempotent). On a back-nav remount the slice is
  // already present and `seed` no-ops, restoring the whole scrolled list.
  useState(() => useBrowseStore.getState().seed(snapshotKey, seedSlice));

  // Fall back to `seedSlice` in case the subscription hasn't reflected the
  // just-written seed on the very first render (they're identical).
  const s = (useBrowseStore((x) => x.slices[snapshotKey]) ??
    seedSlice) as BrowserState<T>;

  const { query, sort, filters, results, total, hasMore, status } = s;

  const search = useDebouncedValue(query, 250).trim().toLowerCase();

  const filterSig = Object.keys(filters)
    .sort()
    .map((k) => `${k}=${filters[k].join(",")}`)
    .join("&");
  const queryKey = `${endpoint}|${search}|${sort}|${filterSig}`;

  // Reset to page 0 when the query, sort, or filters actually change. Old rows
  // stay put (dimmed by the view) until the new page lands, then swap. The guard
  // reads `loadedKey` from the store (not a dep), so it survives StrictMode's
  // double-invoke and back-nav remounts without a spurious page-0 refetch.
  useEffect(() => {
    if (queryKey === useBrowseStore.getState().slices[snapshotKey]?.loadedKey)
      return;
    patch(snapshotKey, { status: "loading", loadedKey: queryKey });
    const controller = new AbortController();
    fetchPage<T>(endpoint, search, sort, filters, 0, controller.signal)
      .then((page) => {
        if (!page) return;
        patch(snapshotKey, {
          results: page.results,
          total: page.total,
          hasMore: page.hasMore,
          status: "idle",
        });
      })
      .catch(() => patch(snapshotKey, { status: "idle" }));
    return () => controller.abort();
  }, [queryKey, endpoint, search, sort, filters, snapshotKey, patch]);

  const onIntersect = useCallback(
    (intersecting: boolean) => {
      if (!intersecting) return;
      const slice = useBrowseStore.getState().slices[snapshotKey];
      if (!slice || slice.status !== "idle" || !slice.hasMore) return;

      const { sort, filters, results, loadedKey } = slice as BrowserState<T>;
      const controller = new AbortController();
      patch(snapshotKey, { status: "appending" });
      // Use the debounced `search` (matching the loaded page), not the raw
      // store query, so an append fired mid-debounce can't fetch a different
      // query than what's currently loaded.
      fetchPage<T>(endpoint, search, sort, filters, results.length, controller.signal)
        .then((page) => {
          if (!page) return;
          // Dropped if the list changed under the in-flight append.
          if (
            useBrowseStore.getState().slices[snapshotKey]?.loadedKey !==
            loadedKey
          )
            return;
          patch(snapshotKey, (prev) => ({
            results: [...prev.results, ...page.results],
            total: page.total,
            hasMore: page.hasMore,
            status: "idle",
          }));
        })
        .catch(() => patch(snapshotKey, { status: "idle" }));
    },
    [endpoint, snapshotKey, patch, search],
  );

  function changeSort(next: SortKey) {
    if (next === sort) return;
    patch(snapshotKey, { sort: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    query,
    setQuery: (query: string) => patch(snapshotKey, { query }),
    sort,
    setSort: changeSort,
    filters,
    setFilters: (filters: Filters) => patch(snapshotKey, { filters }),
    rows: results,
    resultCount: total,
    isLast: !hasMore,
    isEmpty: results.length === 0,
    isLoading: status === "loading",
    isAppending: status === "appending",
    onIntersect,
  };
}
