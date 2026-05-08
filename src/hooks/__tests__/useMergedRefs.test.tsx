import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { render } from '@testing-library/react';
import { useMergedRefs } from '@/hooks/useMergedRefs';

describe('useMergedRefs', () => {
  it('assigns to ref objects and calls function refs', () => {
    const fn = vi.fn();
    const objRef: { current: HTMLDivElement | null } = { current: null };

    function Demo() {
      const merged = useMergedRefs<HTMLDivElement>(objRef, fn);
      return <div ref={merged} data-testid="el" />;
    }
    const { getByTestId } = render(<Demo />);
    const el = getByTestId('el');
    expect(objRef.current).toBe(el);
    expect(fn).toHaveBeenCalledWith(el);
  });

  it('tolerates null and undefined refs', () => {
    function Demo() {
      const merged = useMergedRefs<HTMLDivElement>(null, undefined);
      return <div ref={merged} />;
    }
    expect(() => render(<Demo />)).not.toThrow();
  });

  it('forwards to a useRef ref object', () => {
    let captured: HTMLDivElement | null = null;
    function Demo() {
      const r = useRef<HTMLDivElement>(null);
      const merged = useMergedRefs<HTMLDivElement>(r, (el) => {
        captured = el;
      });
      return <div ref={merged} data-testid="el" />;
    }
    const { getByTestId } = render(<Demo />);
    expect(captured).toBe(getByTestId('el'));
  });
});
