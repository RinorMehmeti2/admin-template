import { useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

export interface UseTypeaheadOptions<T> {
  items: ReadonlyArray<T>;
  getItemValue: (item: T) => string;
  onMatch: (index: number) => void;
  resetMs?: number;
  /**
   * Index to search forward *from* (so repeated keypresses with the same
   * prefix advance through matches). Optional — searches from 0 if absent.
   */
  getCurrentIndex?: () => number;
  /** Stop processing keys (e.g., when listbox is closed). */
  enabled?: boolean;
}

export interface UseTypeaheadReturn {
  onKeyDown: (e: ReactKeyboardEvent) => void;
}

/**
 * ARIA-APG-style typeahead. Each printable keystroke appends to a buffer that
 * resets after `resetMs` of inactivity. On every key, the next item whose
 * value starts with the buffer (case-insensitive) is reported via onMatch.
 */
export function useTypeahead<T>({
  items,
  getItemValue,
  onMatch,
  resetMs = 500,
  getCurrentIndex,
  enabled = true,
}: UseTypeaheadOptions<T>): UseTypeaheadReturn {
  const buffer = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (!enabled) return;
      if (e.key.length !== 1) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Skip whitespace-only keys (Space) so we don't hijack input typing.
      if (!/\S/.test(e.key)) return;

      if (timer.current !== null) clearTimeout(timer.current);
      buffer.current += e.key.toLowerCase();
      timer.current = setTimeout(() => {
        buffer.current = '';
        timer.current = null;
      }, resetMs);

      if (items.length === 0) return;

      const start = getCurrentIndex?.() ?? -1;
      // When the buffer is a single character, advance past the current match
      // (so repeated keys cycle); otherwise start from current.
      const startFrom = start >= 0 && buffer.current.length === 1 ? start + 1 : Math.max(start, 0);

      for (let i = 0; i < items.length; i += 1) {
        const idx = (startFrom + i) % items.length;
        const item = items[idx];
        if (item === undefined) continue;
        const value = getItemValue(item).toLowerCase();
        if (value.startsWith(buffer.current)) {
          onMatch(idx);
          return;
        }
      }
    },
    [enabled, items, getItemValue, onMatch, resetMs, getCurrentIndex],
  );

  return { onKeyDown };
}
