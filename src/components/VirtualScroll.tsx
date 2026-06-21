import { Dispatch, SetStateAction, useEffect, useRef } from "react";

type VirtualScrollProps = {
  intersectCallback: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  isLast: boolean;
};

export function VirtualScroll({
  intersectCallback,
  isLoading,
  isLast,
}: VirtualScrollProps) {
  const loader = useRef<HTMLDivElement>(null);
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isLoading) return;

    const node = loader.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = setTimeout(() => {
          intersectCallback(entry.isIntersecting);
        }, 1000);
      },
      { root: null, rootMargin: "0px", threshold: 1.0 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      clearTimeout(loadMoreTimeoutRef.current);
    };
  }, [isLoading, intersectCallback]);

  if (isLoading) return <p className="text-center">Loading...</p>;

  if (isLast) return <p className="text-center">End of content</p>;

  return <div ref={loader}></div>;
}
