import { useCallback, useState } from 'react';

/*
 * `useErrorHandler` returns a callback that re-throws an error during the
 * next render. React's <ErrorBoundary> only catches errors thrown during
 * render, in lifecycle methods, or inside the constructors of the tree below
 * it — it does NOT catch:
 *
 *   - errors in event handlers
 *   - errors in async code (promises, setTimeout, fetch then-chains)
 *
 * This hook bridges those into a render-phase throw, which the nearest
 * ancestor boundary will then catch.
 *
 * Usage:
 *
 *   const handleError = useErrorHandler();
 *   async function onClick() {
 *     try {
 *       await doThing();
 *     } catch (err) {
 *       handleError(err);
 *     }
 *   }
 */

export type UseErrorHandlerReturn = (error: unknown) => void;

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<unknown>(null);

  if (error !== null) {
    // Re-throw on the next render so the closest ErrorBoundary catches it.
    throw error;
  }

  return useCallback((err: unknown) => {
    // Normalize non-Error throws so the boundary always sees an Error.
    setError(err instanceof Error ? err : new Error(String(err)));
  }, []);
}
