import { useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface MockObserver {
  callback: IntersectionObserverCallback;
  observed: Element[];
  disconnected: boolean;
}

let observers: MockObserver[];
let originalIO: typeof IntersectionObserver | undefined;

beforeEach(() => {
  observers = [];
  originalIO = globalThis.IntersectionObserver as typeof IntersectionObserver | undefined;
  class MockIO {
    callback: IntersectionObserverCallback;
    observed: Element[] = [];
    disconnected = false;
    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb;
      observers.push(this as unknown as MockObserver);
    }
    observe(node: Element) {
      this.observed.push(node);
    }
    disconnect() {
      this.disconnected = true;
    }
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    root = null;
    rootMargin = '0px';
    thresholds = [0];
  }
  // @ts-expect-error — minimal mock for jsdom
  globalThis.IntersectionObserver = MockIO;
});

afterEach(() => {
  if (originalIO !== undefined) {
    globalThis.IntersectionObserver = originalIO;
  }
});

function setup(enabled = true) {
  return renderHook(() => {
    const ref = useRef<HTMLDivElement | null>(null);
    // attach a node so observe() runs
    if (ref.current === null) {
      ref.current = document.createElement('div');
    }
    const onIntersect = vi.fn();
    useIntersectionObserver(ref, onIntersect, { enabled });
    return { ref, onIntersect };
  });
}

describe('useIntersectionObserver', () => {
  it('observes the ref node on mount', () => {
    const { result } = setup();
    expect(observers.length).toBe(1);
    expect(observers[0]!.observed[0]).toBe(result.current.ref.current);
  });

  it('fires onIntersect when an entry is intersecting', () => {
    const { result } = setup();
    act(() => {
      observers[0]!.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        observers[0] as unknown as IntersectionObserver,
      );
    });
    expect(result.current.onIntersect).toHaveBeenCalledTimes(1);
  });

  it('does not fire when no entry is intersecting', () => {
    const { result } = setup();
    act(() => {
      observers[0]!.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        observers[0] as unknown as IntersectionObserver,
      );
    });
    expect(result.current.onIntersect).not.toHaveBeenCalled();
  });

  it('disconnects on unmount', () => {
    const { unmount } = setup();
    expect(observers[0]!.disconnected).toBe(false);
    unmount();
    expect(observers[0]!.disconnected).toBe(true);
  });

  it('does not observe when disabled', () => {
    setup(false);
    expect(observers.length).toBe(0);
  });
});
