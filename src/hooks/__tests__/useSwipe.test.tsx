import { describe, it, expect, vi } from 'vitest';
import { useSwipe } from '@/hooks/useSwipe';
import { render, screen, act } from '@testing-library/react';

function Target(props: Parameters<typeof useSwipe>[0]) {
  const swipe = useSwipe(props);
  return (
    <button
      type="button"
      data-testid="swipe-target"
      data-swiping={swipe.isSwiping}
      data-axis={swipe.axis ?? ''}
      onPointerDown={swipe.onPointerDown}
    >
      target
    </button>
  );
}

interface PointerOpts {
  pointerId?: number;
  pointerType?: string;
  clientX: number;
  clientY: number;
  timeStamp?: number;
}

function firePointer(
  el: Element | Window,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  opts: PointerOpts,
) {
  const ev = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent & {
    pointerId?: number;
    pointerType?: string;
    clientX?: number;
    clientY?: number;
    button?: number;
  };
  Object.defineProperty(ev, 'pointerId', { value: opts.pointerId ?? 1 });
  Object.defineProperty(ev, 'pointerType', { value: opts.pointerType ?? 'mouse' });
  Object.defineProperty(ev, 'clientX', { value: opts.clientX });
  Object.defineProperty(ev, 'clientY', { value: opts.clientY });
  Object.defineProperty(ev, 'button', { value: 0 });
  if (opts.timeStamp !== undefined) {
    Object.defineProperty(ev, 'timeStamp', { value: opts.timeStamp });
  }
  act(() => {
    el.dispatchEvent(ev);
  });
}

describe('useSwipe', () => {
  it('locks to vertical axis on downward drag and fires onSwipe down past threshold', () => {
    const onSwipe = vi.fn();
    const onEnd = vi.fn();
    render(<Target axis="y" dismissThreshold={50} onSwipe={onSwipe} onSwipeEnd={onEnd} />);
    const target = screen.getByTestId('swipe-target');
    firePointer(target, 'pointerdown', { clientX: 100, clientY: 100, timeStamp: 0 });
    firePointer(window, 'pointermove', { clientX: 102, clientY: 110, timeStamp: 50 });
    expect(target.dataset.axis).toBe('y');
    firePointer(window, 'pointermove', { clientX: 102, clientY: 160, timeStamp: 100 });
    firePointer(window, 'pointerup', { clientX: 102, clientY: 160, timeStamp: 150 });
    expect(onSwipe).toHaveBeenCalledWith(
      'down',
      expect.objectContaining({ axis: 'y' }),
    );
    expect(onEnd).toHaveBeenCalledWith(true, expect.objectContaining({ axis: 'y' }));
  });

  it('does not fire onSwipe when below distance threshold and velocity not crossed', () => {
    const onSwipe = vi.fn();
    // velocity in jsdom is huge (events fire ~instantly) — bump threshold past
    // what 30px in 1ms can produce.
    render(<Target axis="y" dismissThreshold={100} velocityThreshold={1_000_000} onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');
    firePointer(target, 'pointerdown', { clientX: 0, clientY: 0 });
    firePointer(window, 'pointermove', { clientX: 0, clientY: 30 });
    firePointer(window, 'pointerup', { clientX: 0, clientY: 30 });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('horizontal axis lock fires "right" on positive dx', () => {
    const onSwipe = vi.fn();
    render(<Target axis="x" dismissThreshold={20} onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');
    firePointer(target, 'pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
    firePointer(window, 'pointermove', { clientX: 30, clientY: 0, timeStamp: 50 });
    firePointer(window, 'pointerup', { clientX: 30, clientY: 0, timeStamp: 60 });
    expect(onSwipe).toHaveBeenCalledWith('right', expect.objectContaining({ axis: 'x' }));
  });

  it('rejects mouse when touchOnly=true', () => {
    const onStart = vi.fn();
    render(<Target axis="y" touchOnly onSwipeStart={onStart} />);
    const target = screen.getByTestId('swipe-target');
    firePointer(target, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerType: 'mouse',
      timeStamp: 0,
    });
    firePointer(window, 'pointermove', { clientX: 0, clientY: 50, timeStamp: 10 });
    expect(onStart).not.toHaveBeenCalled();
  });

  it('high-velocity flick commits even below distance threshold', () => {
    const onSwipe = vi.fn();
    render(
      <Target axis="y" dismissThreshold={500} velocityThreshold={200} onSwipe={onSwipe} />,
    );
    const target = screen.getByTestId('swipe-target');
    firePointer(target, 'pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
    firePointer(window, 'pointermove', { clientX: 0, clientY: 40, timeStamp: 80 });
    firePointer(window, 'pointerup', { clientX: 0, clientY: 40, timeStamp: 80 });
    // 40 px / 80 ms = 500 px/s ≥ 200
    expect(onSwipe).toHaveBeenCalledWith('down', expect.anything());
  });

  it('pointercancel ends without commit', () => {
    const onSwipe = vi.fn();
    const onEnd = vi.fn();
    render(<Target axis="y" dismissThreshold={10} onSwipe={onSwipe} onSwipeEnd={onEnd} />);
    const target = screen.getByTestId('swipe-target');
    firePointer(target, 'pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
    firePointer(window, 'pointermove', { clientX: 0, clientY: 30, timeStamp: 50 });
    firePointer(window, 'pointercancel', { clientX: 0, clientY: 30, timeStamp: 50 });
    expect(onSwipe).not.toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalledWith(false, expect.anything());
  });
});
