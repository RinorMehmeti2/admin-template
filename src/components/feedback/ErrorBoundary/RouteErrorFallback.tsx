import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Alert } from '@/components/feedback/Alert';
import { ErrorDetails } from './DefaultErrorFallback';
import type { ErrorFallbackProps } from './ErrorBoundary';

/*
 * In-content fallback for per-route / per-feature boundaries. App chrome
 * (sidebar, topbar) stays put — only the route content is replaced. Use as
 * the `fallback` prop on a route-level <ErrorBoundary>, or as the router's
 * `errorElement` (via <RouterErrorElement>, see below).
 */

export function RouteErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Alert
        variant="danger"
        icon={<AlertTriangle className="h-5 w-5" />}
        title="This view crashed"
        description="The rest of the app is still running. Reset to try again, or report this to the team."
        actions={
          <>
            <Button size="sm" onClick={reset}>
              Try again
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload page
            </Button>
          </>
        }
      />
      <ErrorDetails error={error} />
    </div>
  );
}
