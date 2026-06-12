import { useEffect, useRef } from "react";

interface UseInfiniteScrollSentinelOptions {
  enabled: boolean;
  onIntersect: () => void;
}

export function useInfiniteScrollSentinel({
  enabled,
  onIntersect,
}: UseInfiniteScrollSentinelOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onIntersectRef.current();
        }
      },
      { rootMargin: "120px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return sentinelRef;
}
