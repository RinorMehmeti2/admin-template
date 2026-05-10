import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/*
 * React logs caught errors to the console regardless of whether a boundary
 * handles them. Silence the noise so test output stays useful.
 */
let consoleError: ReturnType<typeof vi.spyOn>;
let consoleErrorReporter: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  consoleErrorReporter = consoleError;
});

afterEach(() => {
  consoleError.mockRestore();
  void consoleErrorReporter;
});

function Boom({ when }: { when: boolean }) {
  if (when) throw new Error('boom');
  return <p>safe</p>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <p>safe content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('catches a render error and shows the default fallback', () => {
    render(
      <ErrorBoundary>
        <Boom when />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders a render-prop fallback with error + reset', () => {
    render(
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div>
            <p>caught: {error.message}</p>
            <button type="button" onClick={reset}>
              reset
            </button>
          </div>
        )}
      >
        <Boom when />
      </ErrorBoundary>,
    );
    expect(screen.getByText('caught: boom')).toBeInTheDocument();
  });

  it('renders a static-node fallback', () => {
    render(
      <ErrorBoundary fallback={<p>static fallback</p>}>
        <Boom when />
      </ErrorBoundary>,
    );
    expect(screen.getByText('static fallback')).toBeInTheDocument();
  });

  it('reset() clears the error state and re-renders children', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <ErrorBoundary
          fallback={({ reset }) => (
            <button
              type="button"
              onClick={() => {
                setShouldThrow(false);
                reset();
              }}
            >
              fix-and-reset
            </button>
          )}
        >
          <Boom when={shouldThrow} />
        </ErrorBoundary>
      );
    }

    render(<Wrapper />);
    expect(screen.getByText('fix-and-reset')).toBeInTheDocument();
    await user.click(screen.getByText('fix-and-reset'));
    expect(screen.getByText('safe')).toBeInTheDocument();
  });

  it('resetKeys identity-change triggers a reset', () => {
    function Harness({ k, throwIt }: { k: number; throwIt: boolean }) {
      return (
        <ErrorBoundary resetKeys={[k]} fallback={<p>fallback</p>}>
          <Boom when={throwIt} />
        </ErrorBoundary>
      );
    }
    const { rerender } = render(<Harness k={1} throwIt />);
    expect(screen.getByText('fallback')).toBeInTheDocument();
    // Same value — no reset.
    rerender(<Harness k={1} throwIt={false} />);
    expect(screen.getByText('fallback')).toBeInTheDocument();
    // Identity change — reset, child renders normally.
    rerender(<Harness k={2} throwIt={false} />);
    expect(screen.getByText('safe')).toBeInTheDocument();
  });

  it('onError fires with the error and componentStack', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError} fallback={<p>fb</p>}>
        <Boom when />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    const [err, info] = onError.mock.calls[0]!;
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('boom');
    expect(typeof info.componentStack).toBe('string');
    expect(info.componentStack.length).toBeGreaterThan(0);
  });
});

describe('ErrorBoundary — interactions with reportError', () => {
  it('logs structured payload to console.error via the reporter', () => {
    render(
      <ErrorBoundary fallback={<p>fb</p>} source="test-source">
        <Boom when />
      </ErrorBoundary>,
    );
    // The reporter calls console.error with `'[error]'` plus a serialized payload.
    const reporterCall = consoleError.mock.calls.find(
      (call: unknown[]) => call[0] === '[error]',
    );
    expect(reporterCall).toBeDefined();
    const payload = reporterCall![1] as { source: string; message: string };
    expect(payload.source).toBe('test-source');
    expect(payload.message).toBe('boom');
  });

  // Hint to satisfy `act`-related warnings when reset triggers a re-render.
  it('act-friendly reset', () => {
    let resetFn: (() => void) | undefined;
    render(
      <ErrorBoundary
        fallback={({ reset }) => {
          resetFn = reset;
          return <p>fb</p>;
        }}
      >
        <Boom when />
      </ErrorBoundary>,
    );
    expect(screen.getByText('fb')).toBeInTheDocument();
    act(() => {
      resetFn?.();
    });
  });
});
