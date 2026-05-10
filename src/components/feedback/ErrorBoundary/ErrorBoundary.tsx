import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/lib/errorReporter';
import { DefaultErrorFallback } from './DefaultErrorFallback';

/*
 * React error boundary. Class-based because React still has no hook
 * equivalent — `componentDidCatch` and `getDerivedStateFromError` are
 * lifecycle-only.
 *
 * Catches:
 *   - errors thrown during render
 *   - errors in lifecycle methods of descendants
 *   - errors in constructors of descendants
 *
 * Does NOT catch:
 *   - event handlers (use `useErrorHandler` to bridge)
 *   - async code (same — bridge through `useErrorHandler`)
 *   - server-rendering errors
 *   - errors thrown inside the boundary itself
 *
 * `resetKeys` is the canonical way to clear the boundary on navigation:
 * pass `[location.pathname]` and the boundary auto-resets on each route
 * change. If a key value identity-changes, state is reset.
 *
 * `onError` fires with `(error, info)` AFTER the error is captured and
 * AFTER `reportError` has been called — handy for component-local side
 * effects (e.g., toasts) without re-implementing reporting.
 */

export interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export type ErrorFallback = ReactNode | ((props: ErrorFallbackProps) => ReactNode);

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Render-prop or static node. Defaults to `<DefaultErrorFallback>`. */
  fallback?: ErrorFallback;
  /** Side-effect callback. Sentry-style: fires once per caught error. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Reset the boundary when any key value identity-changes (e.g. route). */
  resetKeys?: ReadonlyArray<unknown>;
  /** Tag for the error reporter. Defaults to 'ErrorBoundary'. */
  source?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function keysChanged(prev: ReadonlyArray<unknown>, next: ReadonlyArray<unknown>): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i += 1) {
    if (!Object.is(prev[i], next[i])) return true;
  }
  return false;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    const stack = info.componentStack;
    reportError(error, {
      ...(typeof stack === 'string' ? { componentStack: stack } : {}),
      source: this.props.source ?? 'ErrorBoundary',
    });
    this.props.onError?.(error, info);
  }

  override componentDidUpdate(prevProps: Readonly<ErrorBoundaryProps>): void {
    if (this.state.error === null) return;
    const prevKeys = prevProps.resetKeys ?? [];
    const nextKeys = this.props.resetKeys ?? [];
    if (keysChanged(prevKeys, nextKeys)) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    const fallback = this.props.fallback;
    if (fallback === undefined) {
      return <DefaultErrorFallback error={error} reset={this.reset} />;
    }
    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.reset });
    }
    return fallback;
  }
}
