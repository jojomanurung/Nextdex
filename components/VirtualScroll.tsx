import { Dispatch, SetStateAction, useEffect, useRef } from "react";

type VirtualScroll = {
  intersectCallback: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  isLast: boolean;
};

export default function VirtualScroll({
  intersectCallback,
  isLoading,
  isLast,
}: VirtualScroll) {
  const loader = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreTimeout: NodeJS.Timeout = setTimeout(() => null, 500);
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout>(loadMoreTimeout);

  useEffect(() => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();

    const option: IntersectionObserverInit = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      loadMoreTimeoutRef.current = setTimeout(() => {
        intersectCallback(entry.isIntersecting);
      }, 500);
    }, option);
    if (loader.current) {
      observerRef.current.observe(loader.current);
    }
  }, [isLoading, intersectCallback]);

  if (isLoading) return <p className="text-center">Loading...</p>;

  if (isLast) return <p className="text-center">End of content</p>;

  return <div ref={loader}></div>;
}
