import { useEffect, useRef } from 'react';

export function useFocusReturn(active: boolean): void {
  const prevRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      prevRef.current = document.activeElement as HTMLElement | null;
      return;
    }
    const prev = prevRef.current;
    if (prev !== null && document.contains(prev) && typeof prev.focus === 'function') {
      prev.focus();
    }
    prevRef.current = null;
  }, [active]);
}
