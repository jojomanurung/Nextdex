"use client";

import { useEffect, useRef } from "react";

type VirtualScrollProps = {
  intersectCallback: (intersecting: boolean) => void;
  isLast: boolean;
};

export function VirtualScroll({
  intersectCallback,
  isLast,
}: VirtualScrollProps) {
  const loader = useRef<HTMLDivElement>(null);
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const node = loader.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = setTimeout(() => {
          intersectCallback(entry.isIntersecting);
        }, 500);
      },
      { root: null, rootMargin: "0px", threshold: 1.0 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      clearTimeout(loadMoreTimeoutRef.current);
    };
  }, [intersectCallback]);

  // Keep the sentinel node always mounted so the observer stays attached to it.
  // Unmounting it (e.g. when isLast flips true during a short search result) and
  // remounting on clear would orphan the observer and break infinite scroll.
  return (
    <div ref={loader} className="flex h-8 items-center justify-center">
      {isLast && <p className="text-center">End of content</p>}
    </div>
  );
}
