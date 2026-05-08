import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDisclosure } from '@/hooks/useDisclosure';

describe('useDisclosure', () => {
  it('defaults to closed', () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it('respects initial value', () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('open / close / toggle / setOpen', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.setOpen(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('handlers are stable across renders', () => {
    const { result, rerender } = renderHook(() => useDisclosure());
    const ref = result.current;
    rerender();
    expect(result.current.open).toBe(ref.open);
    expect(result.current.close).toBe(ref.close);
    expect(result.current.toggle).toBe(ref.toggle);
    expect(result.current.setOpen).toBe(ref.setOpen);
  });
});
