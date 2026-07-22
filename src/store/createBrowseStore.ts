import { create } from "zustand";
import { PAGE_LIMIT } from "@constant/pagination";
import { SortKey, DEFAULT_SORT } from "@constant/sort";

export type Filters = Record<string, string[]>;
export type Status = "idle" | "loading" | "appending";
export type QueryResult<T> = { results: T[]; total: number; hasMore: boolean };

export type BrowseState<T> = {
  query: string;
  sort: SortKey;
  filters: Filters;
  results: T[];
  total: number;
  hasMore: boolean;
  status: Status;
  initialized: boolean;
  init: (initial: QueryResult<T>) => void;
  setQuery: (q: string) => void;
  setSort: (next: SortKey) => void;
  setFilters: (next: Filters) => void;
  loadMore: () => void;
};

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

// Builds one concrete, module-scoped browse store. Session-persistent across
// client navigation (lives outside React), resets on a full refresh. Every
// action fires on a user event — there are no effects — so the mount/StrictMode
// double-fetch and seed-vs-subscription races are structurally impossible.
export function createBrowseStore<T>(endpoint: string) {
  return create<BrowseState<T>>((set, get) => {
    // Per-store imperative state, outside React.
    let controller: AbortController | null = null;
    let seq = 0; // monotonic request marker; a newer run invalidates older ones
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    // The params that produced the current results — what `append` paginates.
    let loaded = {
      query: "",
      sort: DEFAULT_SORT as SortKey,
      filters: {} as Filters,
    };

    async function run(offset: number, mode: "reset" | "append") {
      const params =
        mode === "reset"
          ? {
              query: get().query.trim().toLowerCase(),
              sort: get().sort,
              filters: get().filters,
            }
          : loaded;

      controller?.abort();
      controller = new AbortController();
      const mySeq = ++seq;
      set({ status: mode === "reset" ? "loading" : "appending" });

      try {
        const page = await fetchPage<T>(
          endpoint,
          params.query,
          params.sort,
          params.filters,
          offset,
          controller.signal,
        );
        if (!page || mySeq !== seq) return; // aborted or superseded
        if (mode === "reset") {
          loaded = params;
          set({
            results: page.results,
            total: page.total,
            hasMore: page.hasMore,
            status: "idle",
          });
        } else {
          set((s) => ({
            results: [...s.results, ...page.results],
            total: page.total,
            hasMore: page.hasMore,
            status: "idle",
          }));
        }
      } catch {
        if (mySeq === seq) set({ status: "idle" });
      }
    }

    return {
      query: "",
      sort: DEFAULT_SORT,
      filters: {},
      results: [],
      total: 0,
      hasMore: false,
      status: "idle",
      initialized: false,

      // Idempotent seed from the SSR result. First mount seeds; a back-nav
      // remount finds `initialized` and no-ops (list restored); refresh reseeds.
      init: (initial) => {
        if (get().initialized) return;
        loaded = { query: "", sort: DEFAULT_SORT, filters: {} };
        set({
          results: initial.results,
          total: initial.total,
          hasMore: initial.hasMore,
          initialized: true,
        });
      },

      setQuery: (q) => {
        set({ query: q });
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => run(0, "reset"), 250);
      },

      setSort: (next) => {
        if (next === get().sort) return;
        set({ sort: next });
        run(0, "reset");
      },

      setFilters: (next) => {
        set({ filters: next });
        run(0, "reset");
      },

      loadMore: () => {
        const { status, hasMore, results } = get();
        if (status !== "idle" || !hasMore) return;
        run(results.length, "append");
      },
    };
  });
}
