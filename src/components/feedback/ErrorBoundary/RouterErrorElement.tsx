import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { reportError } from '@/lib/errorReporter';
import { DefaultErrorFallback } from './DefaultErrorFallback';
import { RouteErrorFallback } from './RouteErrorFallback';
import type { ErrorFallback, ErrorFallbackProps } from './ErrorBoundary';

/*
 * Adapter for react-router v7's `errorElement` slot. The router intercepts
 * render errors inside a route subtree and renders this element instead —
 * so this is the equivalent of an <ErrorBoundary> for route-level catches.
 *
 * Defaults to <RouteErrorFallback>; pass a different `fallback` for the
 * root route, where the chrome is gone and the full-page surface is right.
 *
 * `reset` here re-runs the same URL by reloading the page. react-router has
 * no first-class "clear the route error" API, and a soft refresh would
 * leave the same render to throw again.
 */

export interface RouterErrorElementProps {
  fallback?: ErrorFallback;
  source?: string;
}

function normalize(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'object' && error !== null) {
    const e = error as { status?: number; statusText?: string; data?: unknown };
    if (typeof e.status === 'number') {
      const next = new Error(
        `${e.status}${e.statusText !== undefined ? ` ${e.statusText}` : ''}`,
      );
      next.name = 'RouteError';
      return next;
    }
  }
  return new Error(String(error));
}

export function RouterErrorElement({
  fallback,
  source = 'router',
}: RouterErrorElementProps = {}) {
  const raw = useRouteError();
  const error = normalize(raw);

  useEffect(() => {
    reportError(error, { source });
  }, [error, source]);

  const reset = (): void => {
    window.location.reload();
  };

  const props: ErrorFallbackProps = { error, reset };

  if (fallback === undefined) return <RouteErrorFallback {...props} />;
  if (typeof fallback === 'function') return fallback(props);
  return fallback;
}

/** Convenience: app-root errorElement. Renders the full-page surface. */
export function RootRouterErrorElement() {
  return <RouterErrorElement fallback={DefaultErrorFallback} source="router-root" />;
}
