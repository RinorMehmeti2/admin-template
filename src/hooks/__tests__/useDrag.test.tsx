import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import { useDrag, type DragDelta } from '@/hooks/useDrag';

function Demo({ onMove, onEnd }: { onMove: (d: DragDelta) => void; onEnd?: () => void }) {
  const [active, setActive] = useState(false);
  const drag = useDrag({
    onMove: (delta) => onMove(delta),
    onStart: () => setActive(true),
    onEnd: () => {
      setActive(false);
      onEnd?.();
    },
  });
  return (
    <button
      type="button"
      data-testid="handle"
      data-dragging={active}
      onPointerDown={drag.onPointerDown}
    >
      drag me
    </button>
  );
}

function pointer(type: string, pointerId: number, clientX: number, clientY: number): PointerEvent {
  // jsdom provides PointerEvent in modern versions.
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId,
    clientX,
    clientY,
    button: 0,
  });
}

describe('useDrag', () => {
  it('reports deltas relative to the drag start', () => {
    const onMove = vi.fn();
    render(<Demo onMove={onMove} />);
    const handle = screen.getByTestId('handle');
    // Stub setPointerCapture in jsdom.
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();

    act(() => {
      handle.dispatchEvent(pointer('pointerdown', 1, 100, 100));
    });
    act(() => {
      window.dispatchEvent(pointer('pointermove', 1, 130, 90));
    });
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove.mock.calls[0]?.[0]).toEqual({ dx: 30, dy: -10, x: 130, y: 90 });

    act(() => {
      window.dispatchEvent(pointer('pointermove', 1, 200, 50));
    });
    expect(onMove.mock.calls[1]?.[0]).toEqual({ dx: 100, dy: -50, x: 200, y: 50 });
  });

  it('ignores moves from a different pointer id', () => {
    const onMove = vi.fn();
    render(<Demo onMove={onMove} />);
    const handle = screen.getByTestId('handle');
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();

    act(() => {
      handle.dispatchEvent(pointer('pointerdown', 1, 100, 100));
    });
    act(() => {
      window.dispatchEvent(pointer('pointermove', 2, 200, 200));
    });
    expect(onMove).not.toHaveBeenCalled();
  });

  it('ends the drag on pointerup and toggles isDragging', () => {
    const onMove = vi.fn();
    const onEnd = vi.fn();
    render(<Demo onMove={onMove} onEnd={onEnd} />);
    const handle = screen.getByTestId('handle');
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();

    expect(handle.dataset.dragging).toBe('false');
    act(() => {
      handle.dispatchEvent(pointer('pointerdown', 1, 0, 0));
    });
    expect(handle.dataset.dragging).toBe('true');
    act(() => {
      window.dispatchEvent(pointer('pointerup', 1, 5, 5));
    });
    expect(handle.dataset.dragging).toBe('false');
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('ends the drag on pointercancel', () => {
    const onMove = vi.fn();
    const onEnd = vi.fn();
    render(<Demo onMove={onMove} onEnd={onEnd} />);
    const handle = screen.getByTestId('handle');
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();

    act(() => {
      handle.dispatchEvent(pointer('pointerdown', 1, 0, 0));
    });
    act(() => {
      window.dispatchEvent(pointer('pointercancel', 1, 0, 0));
    });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('ignores secondary mouse buttons', () => {
    const onMove = vi.fn();
    render(<Demo onMove={onMove} />);
    const handle = screen.getByTestId('handle');
    handle.setPointerCapture = vi.fn();

    const ev = new PointerEvent('pointerdown', {
      bubbles: true,
      pointerId: 1,
      clientX: 0,
      clientY: 0,
      button: 2,
    });
    act(() => {
      handle.dispatchEvent(ev);
    });
    expect(handle.dataset.dragging).toBe('false');
  });
});
