import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusReturn } from '@/hooks/useFocusReturn';

describe('useFocusReturn', () => {
  it('captures on activate and restores on deactivate', () => {
    const original = document.createElement('button');
    document.body.appendChild(original);
    original.focus();
    expect(document.activeElement).toBe(original);

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useFocusReturn(active),
      { initialProps: { active: true } },
    );

    const other = document.createElement('button');
    document.body.appendChild(other);
    other.focus();
    expect(document.activeElement).toBe(other);

    rerender({ active: false });
    expect(document.activeElement).toBe(original);

    original.remove();
    other.remove();
  });

  it('does nothing if previously focused element is no longer in DOM', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.focus();

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useFocusReturn(active),
      { initialProps: { active: true } },
    );

    btn.remove();
    rerender({ active: false });
    expect(document.activeElement).toBe(document.body);
  });
});
