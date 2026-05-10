import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Suspense, useState, type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import {
  LoadingBoundary,
  PageLoader,
  InlineLoader,
  SkeletonGrid,
  SkeletonList,
  SkeletonTable,
  SkeletonForm,
} from './index';

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
});

/* Suspending child: throws a Promise on first render, resolves on second. */
function makeSuspender(): { Suspender: () => ReactElement; resolve: () => void } {
  let resolved = false;
  let resolver: (() => void) | null = null;
  const promise = new Promise<void>((res) => {
    resolver = () => {
      resolved = true;
      res();
    };
  });
  function Suspender() {
    if (!resolved) throw promise;
    return <p>resolved content</p>;
  }
  return { Suspender, resolve: () => resolver?.() };
}

function Boom(): ReactElement {
  throw new Error('boom');
}

describe('LoadingBoundary', () => {
  it('renders fallback while suspended', () => {
    const { Suspender } = makeSuspender();
    render(
      <LoadingBoundary fallback={<p>loading…</p>}>
        <Suspender />
      </LoadingBoundary>,
    );
    expect(screen.getByText('loading…')).toBeInTheDocument();
    expect(screen.queryByText('resolved content')).not.toBeInTheDocument();
  });

  it('renders children once the suspender resolves', async () => {
    const { Suspender, resolve } = makeSuspender();
    render(
      <LoadingBoundary fallback={<p>loading…</p>}>
        <Suspender />
      </LoadingBoundary>,
    );
    expect(screen.getByText('loading…')).toBeInTheDocument();
    resolve();
    expect(await screen.findByText('resolved content')).toBeInTheDocument();
  });

  it('uses <PageLoader /> as the default fallback', () => {
    const { Suspender } = makeSuspender();
    render(
      <LoadingBoundary>
        <Suspender />
      </LoadingBoundary>,
    );
    // PageLoader exposes role="status" with default label "Loading".
    const region = screen.getAllByRole('status').find((el) => el.getAttribute('aria-label') === 'Loading');
    expect(region).toBeDefined();
  });

  it('catches a thrown error and renders the errorFallback render-prop', async () => {
    render(
      <LoadingBoundary
        errorFallback={({ error, reset }) => (
          <div>
            <p>err:{error.message}</p>
            <button onClick={reset}>reset</button>
          </div>
        )}
      >
        <Boom />
      </LoadingBoundary>,
    );
    expect(screen.getByText('err:boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'reset' })).toBeInTheDocument();
  });

  it('catches a thrown error and renders a static errorFallback node', () => {
    render(
      <LoadingBoundary errorFallback={<p>oops</p>}>
        <Boom />
      </LoadingBoundary>,
    );
    expect(screen.getByText('oops')).toBeInTheDocument();
  });

  it('falls back to <DefaultErrorFallback /> when no errorFallback is given', () => {
    render(
      <LoadingBoundary>
        <Boom />
      </LoadingBoundary>,
    );
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  });

  it('does not interfere with a non-throwing, non-suspending child', () => {
    render(
      <LoadingBoundary>
        <p>plain</p>
      </LoadingBoundary>,
    );
    expect(screen.getByText('plain')).toBeInTheDocument();
  });

  it('lets a thrown error reach the error boundary even when wrapped in Suspense', async () => {
    /* Smoke test: errors thrown after suspense resolution still hit the
       outer ErrorBoundary, not the Suspense fallback. */
    function Toggle() {
      const [boom, setBoom] = useState(false);
      if (boom) throw new Error('post-suspend');
      return <button onClick={() => setBoom(true)}>throw</button>;
    }
    render(
      <LoadingBoundary errorFallback={<p>caught</p>}>
        <Suspense fallback={null}>
          <Toggle />
        </Suspense>
      </LoadingBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'throw' }));
    expect(screen.getByText('caught')).toBeInTheDocument();
  });
});

describe('PageLoader', () => {
  it('renders a status region with the default Loading label', () => {
    render(<PageLoader />);
    const region = screen.getAllByRole('status').find((el) => el.getAttribute('aria-label') === 'Loading');
    expect(region).toBeDefined();
    expect(screen.getAllByText('Loading').length).toBeGreaterThan(0);
  });

  it('uses the custom label', () => {
    render(<PageLoader label="Fetching users" />);
    const region = screen
      .getAllByRole('status')
      .find((el) => el.getAttribute('aria-label') === 'Fetching users');
    expect(region).toBeDefined();
  });

  it('hides the visible label when hideLabel is set', () => {
    const { container } = render(<PageLoader label="Hi" hideLabel />);
    const visibleLabel = container.querySelector('span:not(.sr-only)');
    expect(visibleLabel?.textContent).not.toBe('Hi');
  });
});

describe('InlineLoader', () => {
  it('renders inline with the default Loading label', () => {
    render(<InlineLoader />);
    const region = screen
      .getAllByRole('status')
      .find((el) => el.getAttribute('aria-label') === 'Loading' && el.tagName === 'SPAN');
    expect(region).toBeDefined();
  });

  it('uses a custom label', () => {
    render(<InlineLoader label="Saving" />);
    const region = screen
      .getAllByRole('status')
      .find((el) => el.getAttribute('aria-label') === 'Saving');
    expect(region).toBeDefined();
  });
});

describe('Skeleton presets', () => {
  it('SkeletonGrid renders the requested count of cards', () => {
    const { container } = render(<SkeletonGrid count={5} data-testid="grid" />);
    const cards = container.querySelectorAll('[data-testid="grid"] > div');
    expect(cards.length).toBe(5);
  });

  it('SkeletonGrid uses the default count of 6', () => {
    const { container } = render(<SkeletonGrid data-testid="grid" />);
    const cards = container.querySelectorAll('[data-testid="grid"] > div');
    expect(cards.length).toBe(6);
  });

  it('SkeletonList renders the requested count of rows', () => {
    const { container } = render(<SkeletonList count={3} data-testid="list" />);
    const rows = container.querySelectorAll('[data-testid="list"] > div');
    expect(rows.length).toBe(3);
  });

  it('SkeletonList uses the default count of 5', () => {
    const { container } = render(<SkeletonList data-testid="list" />);
    const rows = container.querySelectorAll('[data-testid="list"] > div');
    expect(rows.length).toBe(5);
  });

  it('SkeletonTable renders header + count rows', () => {
    const { container } = render(<SkeletonTable count={4} columns={3} data-testid="t" />);
    /* Structure: outer > [header, body]; body > rows. */
    const body = container.querySelector('[data-testid="t"] > div:nth-child(2)');
    expect(body).not.toBeNull();
    const rows = body!.querySelectorAll(':scope > div');
    expect(rows.length).toBe(4);
  });

  it('SkeletonTable uses default count of 8', () => {
    const { container } = render(<SkeletonTable data-testid="t" />);
    const body = container.querySelector('[data-testid="t"] > div:nth-child(2)');
    const rows = body!.querySelectorAll(':scope > div');
    expect(rows.length).toBe(8);
  });

  it('SkeletonForm renders the requested count of fields plus action row', () => {
    const { container } = render(<SkeletonForm count={3} data-testid="f" />);
    /* count fields + 1 action row = count+1 children. */
    const children = container.querySelectorAll('[data-testid="f"] > div');
    expect(children.length).toBe(3 + 1);
  });

  it('SkeletonForm uses default count of 4', () => {
    const { container } = render(<SkeletonForm data-testid="f" />);
    const children = container.querySelectorAll('[data-testid="f"] > div');
    expect(children.length).toBe(4 + 1);
  });

  it('each preset exposes role="status" for AT consumers', () => {
    const { rerender } = render(<SkeletonGrid />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<SkeletonList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<SkeletonTable />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<SkeletonForm />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has no a11y violations (every preset)', async () => {
    const { container } = render(
      <div>
        <PageLoader />
        <InlineLoader />
        <SkeletonGrid count={3} columns={3} />
        <SkeletonList count={3} />
        <SkeletonTable count={3} columns={3} />
        <SkeletonForm count={3} />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
