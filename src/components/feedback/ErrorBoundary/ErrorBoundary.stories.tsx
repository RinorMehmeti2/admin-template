import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { DefaultErrorFallback } from './DefaultErrorFallback';
import { RouteErrorFallback } from './RouteErrorFallback';
import { Button } from '@/components/primitives/Button';

export default { title: 'Feedback/ErrorBoundary', component: ErrorBoundary };

function Boom({ when }: { when: boolean }) {
  if (when) throw new Error('Render-phase error from a story child');
  return <p className="text-foreground-muted">Click the button to throw.</p>;
}

function Trigger({ children }: { children: (boom: () => void) => React.ReactNode }) {
  const [, set] = useState(0);
  return <>{children(() => set((n) => n + 1))}</>;
}

export const DefaultFallback = {
  render: () => (
    <ErrorBoundary>
      <Throws />
    </ErrorBoundary>
  ),
};

export const InContentFallback = {
  render: () => (
    <ErrorBoundary fallback={RouteErrorFallback}>
      <Throws />
    </ErrorBoundary>
  ),
};

export const RenderPropFallback = {
  render: () => (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="space-y-2 rounded-md border border-danger/30 bg-danger/10 p-4">
          <p className="font-medium text-danger">Caught: {error.message}</p>
          <Button size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      )}
    >
      <Throws />
    </ErrorBoundary>
  ),
};

export const StaticFallbackUsage = {
  render: () => (
    <ErrorBoundary fallback={<p className="text-danger">Something broke.</p>}>
      <Throws />
    </ErrorBoundary>
  ),
};

export const FallbackPreviewOnly = {
  name: 'Fallback (preview)',
  render: () => (
    <DefaultErrorFallback
      error={Object.assign(new Error('Preview error'), {
        stack: 'Error: Preview error\n    at Component (Preview.tsx:1:1)',
      })}
      reset={() => undefined}
    />
  ),
};

function Throws() {
  return (
    <Trigger>
      {(boom) => (
        <div className="space-y-2">
          <Boom when={false} />
          <Button
            variant="danger"
            onClick={() => {
              boom();
              throw new Error('Story throw');
            }}
          >
            Throw an error
          </Button>
        </div>
      )}
    </Trigger>
  );
}
