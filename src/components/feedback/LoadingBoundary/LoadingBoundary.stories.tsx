import { Suspense, useState } from 'react';
import { LoadingBoundary } from './LoadingBoundary';
import { PageLoader } from './PageLoader';
import { InlineLoader } from './InlineLoader';
import { SkeletonGrid, SkeletonList, SkeletonTable, SkeletonForm } from './Skeletons';
import { Button } from '@/components/primitives/Button';

export default { title: 'Feedback/LoadingBoundary', component: LoadingBoundary };

/* Suspending child controlled by external promise. */
function makeSuspender() {
  let resolved = false;
  let resolver: (() => void) | null = null;
  const promise = new Promise<void>((res) => {
    resolver = () => {
      resolved = true;
      res();
    };
  });
  function Suspender({ children }: { children: React.ReactNode }) {
    if (!resolved) throw promise;
    return <>{children}</>;
  }
  return { Suspender, resolve: () => resolver?.() };
}

function ResolveButton({ onResolve }: { onResolve: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      onClick={() => {
        onResolve();
        setDone(true);
      }}
      disabled={done}
    >
      {done ? 'Resolved' : 'Resolve'}
    </Button>
  );
}

export const DefaultPageLoader = {
  render: () => {
    const { Suspender, resolve } = makeSuspender();
    return (
      <div className="space-y-3">
        <ResolveButton onResolve={resolve} />
        <LoadingBoundary>
          <Suspender>
            <p className="rounded-md border border-border bg-surface p-4">Loaded content.</p>
          </Suspender>
        </LoadingBoundary>
      </div>
    );
  },
};

export const WithSkeletonTable = {
  render: () => {
    const { Suspender, resolve } = makeSuspender();
    return (
      <div className="space-y-3">
        <ResolveButton onResolve={resolve} />
        <LoadingBoundary fallback={<SkeletonTable count={6} columns={4} />}>
          <Suspender>
            <p>Table data loaded.</p>
          </Suspender>
        </LoadingBoundary>
      </div>
    );
  },
};

export const WithSkeletonGrid = {
  render: () => (
    <Suspense fallback={<SkeletonGrid count={6} columns={3} />}>
      <p>Grid loaded.</p>
    </Suspense>
  ),
};

export const WithSkeletonList = {
  render: () => <SkeletonList count={5} />,
};

export const WithSkeletonForm = {
  render: () => <SkeletonForm count={4} />,
};

export const PageLoaderStandalone = {
  render: () => <PageLoader label="Loading users" />,
};

export const InlineLoaderStandalone = {
  render: () => (
    <p className="text-sm">
      Saving changes <InlineLoader label="Saving" />
    </p>
  ),
};

export const ErrorFallback = {
  render: () => {
    function Boom(): React.ReactElement {
      throw new Error('Something blew up while loading');
    }
    return (
      <LoadingBoundary
        errorFallback={({ error, reset }) => (
          <div className="space-y-2 rounded-md border border-danger/30 bg-danger/10 p-4">
            <p className="font-medium text-danger">Caught: {error.message}</p>
            <Button size="sm" variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        )}
      >
        <Boom />
      </LoadingBoundary>
    );
  },
};
