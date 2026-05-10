import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  consoleError.mockRestore();
});

function EventThrower() {
  const handleError = useErrorHandler();
  return (
    <button
      type="button"
      onClick={() => {
        handleError(new Error('event-error'));
      }}
    >
      throw
    </button>
  );
}

function AsyncThrower() {
  const handleError = useErrorHandler();
  return (
    <button
      type="button"
      onClick={() => {
        Promise.resolve().then(() => {
          handleError(new Error('async-error'));
        });
      }}
    >
      throw-async
    </button>
  );
}

describe('useErrorHandler', () => {
  it('forwards an event-handler error to the nearest ErrorBoundary', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary fallback={({ error }) => <p>caught: {error.message}</p>}>
        <EventThrower />
      </ErrorBoundary>,
    );
    await user.click(screen.getByText('throw'));
    expect(screen.getByText('caught: event-error')).toBeInTheDocument();
  });

  it('forwards an async-handler error to the nearest ErrorBoundary', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary fallback={({ error }) => <p>caught: {error.message}</p>}>
        <AsyncThrower />
      </ErrorBoundary>,
    );
    await user.click(screen.getByText('throw-async'));
    // Wait a microtask + render flush.
    await screen.findByText('caught: async-error');
  });

  it('normalizes a non-Error throw into an Error', async () => {
    const user = userEvent.setup();
    function StringThrower() {
      const handleError = useErrorHandler();
      return (
        <button
          type="button"
          onClick={() => {
            handleError('plain string');
          }}
        >
          throw-string
        </button>
      );
    }
    render(
      <ErrorBoundary fallback={({ error }) => <p>caught: {error.message}</p>}>
        <StringThrower />
      </ErrorBoundary>,
    );
    await user.click(screen.getByText('throw-string'));
    expect(screen.getByText('caught: plain string')).toBeInTheDocument();
  });
});
