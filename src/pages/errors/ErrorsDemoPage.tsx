import { useState } from 'react';
import { Bug, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display';
import {
  ErrorBoundary,
  RouteErrorFallback,
} from '@/components/feedback/ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';

/*
 * Manual smoke-test page for the error-boundary infrastructure. Each card
 * exercises one path:
 *
 *   1. Render error  — child throws during render. Caught by class boundary.
 *   2. Event handler — onClick throws synchronously. NOT caught by a class
 *                      boundary on its own; the bridge `useErrorHandler`
 *                      forwards it into render-phase so the boundary fires.
 *   3. Async error   — fetch / setTimeout / promise rejects. Same bridge.
 *
 * Each card has its own <ErrorBoundary> so triggering one does not nuke the
 * whole demo page.
 */

export function ErrorsDemoPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Error boundaries</h1>
        <p className="mt-1 text-foreground-muted">
          Three throwing buttons, three independent boundaries. Trigger any one — the rest of the
          page (and the app shell) keeps running.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <BoundaryCard
          title="Render error"
          description="Child throws inside the render phase."
          icon={<Bug className="h-4 w-4" />}
        >
          <RenderErrorDemo />
        </BoundaryCard>

        <BoundaryCard
          title="Event handler"
          description="onClick throws — bridged via useErrorHandler."
          icon={<Zap className="h-4 w-4" />}
        >
          <EventErrorDemo />
        </BoundaryCard>

        <BoundaryCard
          title="Async error"
          description="setTimeout rejects — bridged via useErrorHandler."
          icon={<Flame className="h-4 w-4" />}
        >
          <AsyncErrorDemo />
        </BoundaryCard>
      </div>
    </div>
  );
}

function BoundaryCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-foreground-muted">{icon}</span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorBoundary fallback={RouteErrorFallback} source={`demo:${title}`}>
          {children}
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}

function RenderErrorDemo() {
  const [boom, setBoom] = useState(false);
  if (boom) throw new Error('Render-phase error from RenderErrorDemo');
  return (
    <Button variant="danger" onClick={() => setBoom(true)}>
      Throw during render
    </Button>
  );
}

function EventErrorDemo() {
  const handleError = useErrorHandler();
  return (
    <Button
      variant="danger"
      onClick={() => {
        try {
          throw new Error('Event-handler error from EventErrorDemo');
        } catch (err) {
          handleError(err);
        }
      }}
    >
      Throw in onClick
    </Button>
  );
}

function AsyncErrorDemo() {
  const handleError = useErrorHandler();
  return (
    <Button
      variant="danger"
      onClick={() => {
        setTimeout(() => {
          try {
            throw new Error('Async error from AsyncErrorDemo (setTimeout)');
          } catch (err) {
            handleError(err);
          }
        }, 50);
      }}
    >
      Throw in setTimeout
    </Button>
  );
}
