import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PokemonData } from "@dex/interfaces/pokemon";
import { PokemonIndexEntry } from "@dex/lib/pokemon";
import { usePokemonList } from "@dex/context/PokemonListContext";
import { useDebouncedValue } from "@dex/hooks/useDebouncedValue";
import { useLazyDetails } from "@dex/hooks/useLazyDetails";
import { dexNo } from "@dex/constant/pokemonMeta";
import { PAGE_LIMIT } from "@dex/constant/pagination";
import { SortKey } from "@dex/components/home/ControlDeck";

type UsePokedexBrowserArgs = {
  results: PokemonData[];
  index: PokemonIndexEntry[];
};

// A query matches an entry on its name or its zero-padded dex number, both as
// case-insensitive substrings — so "char", "25" and "025" all find their mon.
function matchesQuery(entry: PokemonIndexEntry, query: string): boolean {
  return entry.name.includes(query) || dexNo(entry.id).includes(query);
}

// How each sort key orders the dex. Offering a new ordering is a two-line
// change: add a comparator here and a matching <option> in ControlDeck.
type Comparator = (a: PokemonIndexEntry, b: PokemonIndexEntry) => number;
const SORT_COMPARATORS: Record<SortKey, Comparator> = {
  number: (a, b) => a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
  reverseNum: (a, b) => b.id - a.id,
  reverseName: (a, b) => b.name.localeCompare(a.name),
};

// The Nextdex "browser engine". It owns one idea: take the full id+name index,
// filter + sort it, then reveal a growing window whose row details are lazily
// loaded. Browsing and searching keep separate reveal depths, so clearing the
// search drops you straight back onto the browse list, right where you left it.
export function usePokedexBrowser({ results, index }: UsePokedexBrowserArgs) {
  const { browseCount, setBrowseCount } = usePokemonList();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("number");

  const debouncedQuery = useDebouncedValue(query, 250);
  const search = debouncedQuery.trim().toLowerCase();
  const isSearching = search !== "";

  // Filter + sort the whole dex. It's only id+name, so re-running this over all
  // ~1300 entries on each keystroke is cheap.
  const matches = useMemo(() => {
    const filtered = isSearching
      ? index.filter((entry) => matchesQuery(entry, search))
      : index;
    return [...filtered].sort(SORT_COMPARATORS[sort]);
  }, [index, search, isSearching, sort]);

  // Reveal depth. Browsing persists in context (survives navigation and a
  // search-and-clear); searching uses its own window that resets per new query.
  const [searchCount, setSearchCount] = useState(PAGE_LIMIT);
  // Reset the search window whenever the (debounced) query changes — done during
  // render via the previous-value pattern rather than an effect, so the window
  // shrinks in the same render the new results appear (no transient frame at the
  // prior, deeper depth).
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchCount(PAGE_LIMIT);
  }

  const browseReveal = Math.max(browseCount, PAGE_LIMIT); // context starts at 0
  const revealCount = isSearching ? searchCount : browseReveal;

  const visible = useMemo(
    () => matches.slice(0, revealCount),
    [matches, revealCount],
  );
  const isLast = revealCount >= matches.length;

  // Ensure the visible rows' details are loaded; rows render a skeleton until
  // their fetch lands.
  const visibleNames = useMemo(() => visible.map((e) => e.name), [visible]);
  const { byName, isFetching } = useLazyDetails(visibleNames, results);

  // Re-sorting reorders the whole list, so reset both reveal windows to one page
  // and jump to the top — otherwise a deep carried-over depth would lazy-load
  // hundreds of rows in the new order. Done here on the user's pick (not in an
  // effect watching `sort`), so it skips mount and leaves a depth restored by
  // back-navigation untouched, and the reset lands in the same render as the
  // new order (no transient deep window).
  function changeSort(next: SortKey) {
    if (next === sort) return;
    setSort(next);
    setBrowseCount(PAGE_LIMIT);
    setSearchCount(PAGE_LIMIT);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Infinite scroll. VirtualScroll calls onIntersect with the sentinel's
  // visibility; each time it scrolls fully into view we reveal exactly one more
  // page, so a single pass can't run through page after page. The callback is
  // kept stable (VirtualScroll attaches it to a persistent observer) and reads
  // its guards from a ref, so it always sees the latest state and never grows
  // while a batch is still loading or once we're at the end.
  const growth = useRef({ isFetching, isLast, isSearching });
  useEffect(() => {
    growth.current = { isFetching, isLast, isSearching };
  }, [isFetching, isLast, isSearching]);

  const onIntersect = useCallback(
    (intersecting: boolean) => {
      if (!intersecting) return;
      const { isFetching, isLast, isSearching } = growth.current;
      if (isFetching || isLast) return;
      if (isSearching) setSearchCount((c) => c + PAGE_LIMIT);
      else setBrowseCount((c) => Math.max(c, PAGE_LIMIT) + PAGE_LIMIT);
    },
    [setBrowseCount],
  );

  const rows = useMemo(
    () =>
      visible.map((entry) => ({
        id: entry.id,
        name: entry.name,
        data: byName[entry.name] ?? null,
      })),
    [visible, byName],
  );

  return {
    query,
    setQuery,
    sort,
    setSort: changeSort,
    rows,
    resultCount: matches.length,
    isLast,
    isEmpty: matches.length === 0,
    onIntersect,
  };
}
