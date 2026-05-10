import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary, type ErrorFallback } from '@/components/feedback/ErrorBoundary';
import { PageLoader } from './PageLoader';

/*
 * Pairs <Suspense> with our <ErrorBoundary> so a single wrapper covers both
 * the loading and error legs of a suspense-driven fetch (useSuspenseQuery,
 * lazy routes, etc.). Order matters: ErrorBoundary outside, Suspense inside —
 * a thrown error from the suspended subtree must reach the boundary, while
 * the boundary's fallback should not itself suspend.
 *
 * `fallback` defaults to <PageLoader /> — full-area centered spinner that
 * works for whole-route segments. Pass a Skeleton* preset for content-shaped
 * loading.
 */

export interface LoadingBoundaryProps {
  children: ReactNode;
  /** Suspense fallback. Defaults to <PageLoader />. */
  fallback?: ReactNode;
  /** ErrorBoundary fallback — node or render-prop with `{ error, reset }`. */
  errorFallback?: ErrorFallback;
  /** Forwarded to ErrorBoundary; reset on identity change of any key. */
  resetKeys?: ReadonlyArray<unknown>;
  /** Forwarded source tag for the error reporter. */
  source?: string;
}

export function LoadingBoundary({
  children,
  fallback,
  errorFallback,
  resetKeys,
  source,
}: LoadingBoundaryProps) {
  return (
    <ErrorBoundary
      {...(errorFallback !== undefined ? { fallback: errorFallback } : {})}
      {...(resetKeys !== undefined ? { resetKeys } : {})}
      {...(source !== undefined ? { source } : {})}
    >
      <Suspense fallback={fallback ?? <PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
