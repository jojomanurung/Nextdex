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
    const node = loader.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = setTimeout(() => {
          intersectCallback(entry.isIntersecting);
        }, 300);
      },
      { root: null, rootMargin: "100px", threshold: 0.5 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      clearTimeout(loadMoreTimeoutRef.current);
    };
  }, [intersectCallback]);

  if (isLast) return <p className="text-center">End of content</p>;

  return (
    <div ref={loader} className="flex h-8 items-center justify-center">
      {isLoading && <p className="text-center">Loading...</p>}
    </div>
  );
}
