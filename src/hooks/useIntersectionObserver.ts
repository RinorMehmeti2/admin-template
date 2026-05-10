import { useEffect, type RefObject } from 'react';

export interface UseIntersectionObserverOptions {
  /** Root margin passed to IntersectionObserver. Default '0px'. */
  rootMargin?: string;
  /** Intersection threshold(s). Default 0. */
  threshold?: number | number[];
  /** Disable observation without unmounting. Default true. */
  enabled?: boolean;
  /** Custom root element. Default `null` (viewport). */
  root?: Element | Document | null;
}

/*
 * Fires `onIntersect` when `ref.current` enters the root's viewport. Used by
 * NotificationsPanel for an infinite-scroll sentinel — `onIntersect` triggers
 * `fetchMore`. SSR / no-IntersectionObserver environments are no-ops.
 */
export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  onIntersect: () => void,
  options: UseIntersectionObserverOptions = {},
): void {
  const { rootMargin = '0px', threshold = 0, enabled = true, root = null } = options;

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (node === null) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onIntersect();
            return;
          }
        }
      },
      { root, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // ref is a stable RefObject; we intentionally re-run when enabled / observer
    // options change so a paused panel re-observes correctly when re-opened.
  }, [ref, onIntersect, enabled, rootMargin, threshold, root]);
}
