import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '@/context/ToastProvider';
import { Button } from '@/components/primitives/Button';
import { runAxe } from '@/test-utils/a11y';

// userEvent + vitest fake timers tend to hang together. We use fireEvent
// (synchronous) for the trigger click and fake timers for the
// auto-dismiss timing assertions.

function Trigger() {
  const { toast } = useToast();
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast.success('Saved!')}>success</Button>
      <Button onClick={() => toast.error('Failed', { description: 'Server 500' })}>error</Button>
      <Button onClick={() => toast('Plain')}>plain</Button>
      <Button onClick={() => toast.info('Sticky', { duration: 0 })}>sticky</Button>
    </div>
  );
}

function Harness() {
  return (
    <ToastProvider defaultDuration={5000} position="top-right">
      <Trigger />
    </ToastProvider>
  );
}

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('toast.success creates a toast', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('error toasts use role=alert', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'error' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });

  it('auto-dismiss after duration', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5100);
    });
    expect(screen.queryByText('Saved!')).toBeNull();
  });

  it('duration: 0 is sticky', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'sticky' }));
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByText('Sticky')).toBeInTheDocument();
  });

  it('dismiss button removes toast', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Saved!')).toBeNull();
  });

  it('pauses auto-dismiss on hover', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    const toast = screen.getByTestId('toast');
    fireEvent.mouseEnter(toast);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    fireEvent.mouseLeave(toast);
    act(() => {
      vi.advanceTimersByTime(5500);
    });
    expect(screen.queryByText('Saved!')).toBeNull();
  });

  it('newest toast appears first in the queue', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'plain' }));
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    const toasts = screen.getAllByTestId('toast');
    expect(toasts[0]).toHaveTextContent('Saved!');
    expect(toasts[1]).toHaveTextContent('Plain');
  });

  it('swipe-right past threshold dismisses the toast (touch)', () => {
    vi.useRealTimers();
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    const toast = screen.getByTestId('toast');

    const firePointer = (
      el: Element | Window,
      type: 'pointerdown' | 'pointermove' | 'pointerup',
      opts: { clientX: number; clientY: number },
    ) => {
      const ev = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
      Object.defineProperty(ev, 'pointerId', { value: 1 });
      Object.defineProperty(ev, 'pointerType', { value: 'touch' });
      Object.defineProperty(ev, 'clientX', { value: opts.clientX });
      Object.defineProperty(ev, 'clientY', { value: opts.clientY });
      Object.defineProperty(ev, 'button', { value: 0 });
      act(() => {
        el.dispatchEvent(ev);
      });
    };

    firePointer(toast, 'pointerdown', { clientX: 50, clientY: 0 });
    firePointer(window, 'pointermove', { clientX: 200, clientY: 0 });
    firePointer(window, 'pointerup', { clientX: 200, clientY: 0 });
    expect(screen.queryByText('Saved!')).toBeNull();
  });

  it('has no a11y violations (success + error toasts mounted)', async () => {
    // axe-core uses real microtasks/timeouts internally. Switch to real timers
    // for the assertion; the surrounding suite uses fake timers for the
    // auto-dismiss assertions.
    vi.useRealTimers();
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'success' }));
    fireEvent.click(screen.getByRole('button', { name: 'error' }));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
