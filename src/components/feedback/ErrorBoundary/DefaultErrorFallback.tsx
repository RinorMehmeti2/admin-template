import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import type { ErrorFallbackProps } from './ErrorBoundary';

/*
 * Full-page fallback for the app-level boundary. Centered, no app chrome —
 * AppLayout sits inside the boundary, so when this renders the chrome is
 * already gone. Two actions: "Try again" calls `reset` (good for transient
 * errors), "Go home" hard-navigates to "/" via `window.location` so the
 * router state is rebuilt from scratch.
 */

export function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-surface p-6 shadow-md">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-danger" aria-hidden="true">
            <AlertOctagon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-lg font-semibold leading-tight text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-foreground-muted">
              An unexpected error stopped this page from rendering. Try again, or head back home.
            </p>
          </div>
        </div>

        <ErrorDetails error={error} />

        <div className="flex flex-wrap gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.assign('/');
            }}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Shared technical-details disclosure used by both fallbacks. */
export function ErrorDetails({ error }: { error: Error }) {
  return (
    <details className="rounded-md border border-border bg-surface-muted text-sm">
      <summary className="cursor-pointer select-none px-3 py-2 font-medium text-foreground hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        Show technical details
      </summary>
      <div className="space-y-2 border-t border-border p-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
            Error
          </p>
          <p className="mt-0.5 break-words font-mono text-foreground">
            {error.name}: {error.message}
          </p>
        </div>
        {error.stack !== undefined ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
              Stack
            </p>
            <pre className="mt-0.5 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground-muted">
              {error.stack}
            </pre>
          </div>
        ) : null}
      </div>
    </details>
  );
}
