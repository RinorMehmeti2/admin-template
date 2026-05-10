import { useEffect, useState } from 'react';

/*
 * Returns true while the browser is preparing or rendering the document
 * for print. Components that opt into print expansion (DataTable, Tabs)
 * use this to render all rows / all panels regardless of pagination or
 * forceMount state.
 *
 * Subscribes to both `beforeprint`/`afterprint` events (most reliable) and
 * the `print` media query (fallback for e.g. Chromium "Print preview").
 */
export function usePrintMode(): boolean {
  const [isPrinting, setIsPrinting] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('print').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onBefore = () => setIsPrinting(true);
    const onAfter = () => setIsPrinting(false);
    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);

    let mql: MediaQueryList | null = null;
    let onChange: ((e: MediaQueryListEvent) => void) | null = null;
    if (typeof window.matchMedia === 'function') {
      mql = window.matchMedia('print');
      onChange = (e) => setIsPrinting(e.matches);
      mql.addEventListener('change', onChange);
    }

    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
      if (mql !== null && onChange !== null) mql.removeEventListener('change', onChange);
    };
  }, []);

  return isPrinting;
}
