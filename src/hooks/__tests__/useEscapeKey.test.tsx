import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEscapeKey } from '@/hooks/useEscapeKey';

describe('useEscapeKey', () => {
  it('fires handler on Escape', async () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));
    await userEvent.keyboard('{Escape}');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler, { enabled: false }));
    await userEvent.keyboard('{Escape}');
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire on other keys', async () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));
    await userEvent.keyboard('a');
    await userEvent.keyboard('{Enter}');
    expect(handler).not.toHaveBeenCalled();
  });

  it('skips if event is already defaultPrevented', () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));
    const e = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    e.preventDefault();
    document.dispatchEvent(e);
    expect(handler).not.toHaveBeenCalled();
  });
});
