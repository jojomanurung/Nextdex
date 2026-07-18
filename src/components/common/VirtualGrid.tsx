"use client";

import {
  Fragment,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// A responsive tier: at viewport width ≥ `min`, use these columns + gaps.
// `min` values mirror the Tailwind breakpoints the fallback grid uses.
export type VirtualTier = {
  min: number;
  columns: number;
  colGap: number;
  rowGap: number;
};

function tierFor(tiers: VirtualTier[], width: number): VirtualTier {
  let picked = tiers[0];
  for (const t of tiers) if (width >= t.min) picked = t;
  return picked;
}

type VirtualGridProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Responsive columns + gaps; `min` values mirror the fallback's Tailwind breakpoints. */
  tiers: VirtualTier[];
  /** Initial per-row height guess; refined by measurement once rendered. */
  estimateRowHeight: number;
  /** Classes for the pre-hydration grid — the exact responsive grid the list used before. */
  fallbackClassName: string;
  /** Changes when the query/sort/filter resets, so cached measurements are dropped. */
  resetKey?: string;
  hasMore: boolean;
  isAppending: boolean;
  onEndReached: () => void;
  renderSkeleton?: (index: number) => ReactNode;
  endLabel?: ReactNode;
};

/**
 * Window-scrolled grid virtualization over TanStack Virtual. Only the visible
 * rows (+ overscan) live in the DOM while the full scroll height is reserved, so
 * a list of any length costs a fixed handful of nodes. Rows are virtualized (one
 * per grid row) with dynamic measurement. Pre-hydration it renders the real
 * responsive CSS grid so the SSR first paint is correct and hydration-safe, then
 * hands off to the windowed view.
 */
export function VirtualGrid<T>({
  items,
  getKey,
  renderItem,
  tiers,
  estimateRowHeight,
  fallbackClassName,
  resetKey = "",
  hasMore,
  isAppending,
  onEndReached,
  renderSkeleton,
  endLabel,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [layout, setLayout] = useState<VirtualTier>(() => tiers[0]);
  const [scrollMargin, setScrollMargin] = useState(0);

  const columns = Math.max(1, layout.columns);
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimateRowHeight,
    overscan: 4,
    gap: layout.rowGap,
    scrollMargin,
    // Fold reset + column count into the key so a search/sort/filter change or a
    // breakpoint cross invalidates the cached row measurements.
    getItemKey: (index) => `${resetKey}:${columns}:${index}`,
  });

  const measureOffset = () => {
    const el = containerRef.current;
    if (el) setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
  };

  // Measure the list's document offset + real column count before paint, then
  // hand off to the virtualized view.
  useIsoLayoutEffect(() => {
    setLayout(tierFor(tiers, window.innerWidth));
    measureOffset();
    setHydrated(true);
    // mount only
  }, []);

  // The deck above can change height (e.g. active-filter pills), shifting the
  // list; re-measure the offset when the reset key changes.
  useIsoLayoutEffect(() => {
    if (hydrated) measureOffset();
  }, [resetKey, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const onResize = () => {
      setLayout(tierFor(tiers, window.innerWidth));
      measureOffset();
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [hydrated, tiers]);

  // Infinite load: fetch the next page as the last row scrolls into range.
  // Re-checked on every virtualizer update AND when a fetch finishes
  // (`isAppending` flips), so it chains page-by-page instead of firing once.
  const onEndRef = useRef(onEndReached);
  useEffect(() => {
    onEndRef.current = onEndReached;
  }, [onEndReached]);
  const virtualRows = virtualizer.getVirtualItems();
  useEffect(() => {
    if (!hydrated || !hasMore || isAppending) return;
    const last = virtualRows[virtualRows.length - 1];
    if (last && last.index >= rowCount - 1) onEndRef.current();
  }, [hydrated, hasMore, isAppending, virtualRows, rowCount]);

  const rowGrid = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    columnGap: `${layout.colGap}px`,
  } as const;

  if (!hydrated) {
    return (
      <div ref={containerRef} className={fallbackClassName}>
        {items.map((item) => (
          <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualRows.map((row) => (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="absolute left-0 top-0 w-full"
            style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
          >
            <div className="grid" style={rowGrid}>
              {items
                .slice(row.index * columns, row.index * columns + columns)
                .map((item) => (
                  <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
                ))}
            </div>
          </div>
        ))}
      </div>

      {isAppending && renderSkeleton && (
        <div
          className="grid"
          style={{ ...rowGrid, marginTop: `${layout.rowGap}px` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Fragment key={i}>{renderSkeleton(i)}</Fragment>
          ))}
        </div>
      )}

      {!hasMore && !isAppending && endLabel && (
        <div className="flex h-8 items-center justify-center">{endLabel}</div>
      )}
    </>
  );
}
