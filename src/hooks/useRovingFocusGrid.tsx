import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

/*
 * 2D variant of useRovingFocus for grid widgets (calendars, color pickers,
 * keyboard-grids). Mirrors useRovingFocus's Provider + useItem shape, but
 * registers items by (row, col) and handles 4-axis navigation.
 *
 * Keyboard:
 *   ArrowUp/Down       — move row by ±1
 *   ArrowLeft/Right    — move column by ±1
 *   Home               — start of current row
 *   End                — end of current row
 *   Ctrl/Meta+Home     — first cell in grid
 *   Ctrl/Meta+End      — last cell in grid
 *   PageUp/PageDown    — delegated to `onPageNavigate` (calendars use it for
 *                        prev/next month). The hook does not preventDefault for
 *                        these; the callback owns that decision.
 *
 * Loop defaults to OFF — calendars don't loop edges. Set `loop` to opt in.
 */

interface RovingFocusGridContextValue {
  activeRow: number;
  activeCol: number;
  setActive: (row: number, col: number) => void;
  register: (row: number, col: number, getEl: () => HTMLElement | null) => () => void;
  onItemKeyDown: (e: ReactKeyboardEvent<HTMLElement>, row: number, col: number) => void;
}

const RovingFocusGridContext = createContext<RovingFocusGridContextValue | null>(null);

export type PageNavDirection = -1 | 1;

export interface RovingFocusGridProps {
  loop?: boolean;
  defaultRow?: number;
  defaultCol?: number;
  onPageNavigate?: (
    direction: PageNavDirection,
    currentRow: number,
    currentCol: number,
    e: ReactKeyboardEvent<HTMLElement>,
  ) => void;
  children: ReactNode;
}

export function RovingFocusGrid({
  loop = false,
  defaultRow = 0,
  defaultCol = 0,
  onPageNavigate,
  children,
}: RovingFocusGridProps): JSX.Element {
  const [active, setActiveState] = useState({ row: defaultRow, col: defaultCol });
  const itemsRef = useRef<Map<string, () => HTMLElement | null>>(new Map());

  const onPageRef = useRef(onPageNavigate);
  useEffect(() => {
    onPageRef.current = onPageNavigate;
  });

  const setActive = useCallback((row: number, col: number) => {
    setActiveState({ row, col });
  }, []);

  const register = useCallback((row: number, col: number, getEl: () => HTMLElement | null) => {
    const key = `${row},${col}`;
    itemsRef.current.set(key, getEl);
    return () => {
      itemsRef.current.delete(key);
    };
  }, []);

  const focusAt = useCallback((row: number, col: number) => {
    const getEl = itemsRef.current.get(`${row},${col}`);
    const el = getEl?.() ?? null;
    if (el !== null) {
      el.focus();
      setActiveState({ row, col });
    }
  }, []);

  const onItemKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>, row: number, col: number) => {
      const items = itemsRef.current;
      if (items.size === 0) return;

      // PageUp / PageDown — fully delegated. Caller owns preventDefault.
      if (e.key === 'PageUp' || e.key === 'PageDown') {
        const cb = onPageRef.current;
        if (cb !== undefined) cb(e.key === 'PageDown' ? 1 : -1, row, col, e);
        return;
      }

      // Build a sorted view of registered cells per render.
      const rows: number[] = [];
      const colsByRow = new Map<number, number[]>();
      for (const key of items.keys()) {
        const parts = key.split(',');
        const r = Number(parts[0]);
        const c = Number(parts[1]);
        if (Number.isNaN(r) || Number.isNaN(c)) continue;
        const list = colsByRow.get(r);
        if (list === undefined) {
          colsByRow.set(r, [c]);
          rows.push(r);
        } else {
          list.push(c);
        }
      }
      rows.sort((a, b) => a - b);
      for (const list of colsByRow.values()) list.sort((a, b) => a - b);

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (e.key === 'Home' && ctrlOrMeta) {
        const firstRow = rows[0];
        if (firstRow === undefined) return;
        const firstCol = colsByRow.get(firstRow)?.[0];
        if (firstCol === undefined) return;
        e.preventDefault();
        focusAt(firstRow, firstCol);
        return;
      }
      if (e.key === 'End' && ctrlOrMeta) {
        const lastRow = rows[rows.length - 1];
        if (lastRow === undefined) return;
        const cols = colsByRow.get(lastRow) ?? [];
        const lastCol = cols[cols.length - 1];
        if (lastCol === undefined) return;
        e.preventDefault();
        focusAt(lastRow, lastCol);
        return;
      }
      if (e.key === 'Home') {
        const cols = colsByRow.get(row) ?? [];
        const first = cols[0];
        if (first === undefined) return;
        e.preventDefault();
        focusAt(row, first);
        return;
      }
      if (e.key === 'End') {
        const cols = colsByRow.get(row) ?? [];
        const last = cols[cols.length - 1];
        if (last === undefined) return;
        e.preventDefault();
        focusAt(row, last);
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const cols = colsByRow.get(row) ?? [];
        if (cols.length === 0) return;
        const idx = cols.indexOf(col);
        if (idx === -1) return;
        let next = idx + (e.key === 'ArrowRight' ? 1 : -1);
        if (loop) {
          next = ((next % cols.length) + cols.length) % cols.length;
        } else {
          next = Math.max(0, Math.min(cols.length - 1, next));
        }
        const target = cols[next];
        if (target === undefined) return;
        e.preventDefault();
        if (target !== col) focusAt(row, target);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (rows.length === 0) return;
        const rowIdx = rows.indexOf(row);
        if (rowIdx === -1) return;
        let nextRowIdx = rowIdx + (e.key === 'ArrowDown' ? 1 : -1);
        if (loop) {
          nextRowIdx = ((nextRowIdx % rows.length) + rows.length) % rows.length;
        } else {
          nextRowIdx = Math.max(0, Math.min(rows.length - 1, nextRowIdx));
        }
        const targetRow = rows[nextRowIdx];
        if (targetRow === undefined) return;
        const cols = colsByRow.get(targetRow) ?? [];
        if (cols.length === 0) return;
        // Prefer same column; fall back to nearest column in the target row.
        let targetCol = col;
        if (!cols.includes(col)) {
          const first = cols[0]!;
          targetCol = cols.reduce(
            (best, c) => (Math.abs(c - col) < Math.abs(best - col) ? c : best),
            first,
          );
        }
        e.preventDefault();
        if (targetRow !== row || targetCol !== col) focusAt(targetRow, targetCol);
        return;
      }
    },
    [loop, focusAt],
  );

  const value = useMemo<RovingFocusGridContextValue>(
    () => ({
      activeRow: active.row,
      activeCol: active.col,
      setActive,
      register,
      onItemKeyDown,
    }),
    [active.row, active.col, setActive, register, onItemKeyDown],
  );

  return (
    <RovingFocusGridContext.Provider value={value}>{children}</RovingFocusGridContext.Provider>
  );
}

export interface UseRovingFocusGridItemReturn {
  tabIndex: 0 | -1;
  isActive: boolean;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: () => void;
}

export function useRovingFocusGridItem<T extends HTMLElement>(
  row: number,
  col: number,
  ref: RefObject<T | null>,
): UseRovingFocusGridItemReturn {
  const ctx = useContext(RovingFocusGridContext);
  if (ctx === null) {
    throw new Error('useRovingFocusGridItem must be used within a <RovingFocusGrid>');
  }
  const { activeRow, activeCol, setActive, register, onItemKeyDown } = ctx;

  useEffect(() => register(row, col, () => ref.current), [register, row, col, ref]);

  const isActive = activeRow === row && activeCol === col;
  return {
    tabIndex: isActive ? 0 : -1,
    isActive,
    onKeyDown: (e) => onItemKeyDown(e, row, col),
    onFocus: () => setActive(row, col),
  };
}

/**
 * Imperative helper for callers that prefer building element props inline
 * rather than calling the item hook. Returns props ready to spread onto the
 * cell element. The caller still attaches the ref themselves.
 */
export function useRovingFocusGrid(): {
  activeRow: number;
  activeCol: number;
  setActive: (row: number, col: number) => void;
  getItemProps: <T extends HTMLElement>(
    row: number,
    col: number,
    ref: RefObject<T | null>,
  ) => UseRovingFocusGridItemReturn;
} {
  const ctx = useContext(RovingFocusGridContext);
  if (ctx === null) {
    throw new Error('useRovingFocusGrid must be used within a <RovingFocusGrid>');
  }
  const { activeRow, activeCol, setActive, onItemKeyDown } = ctx;
  return {
    activeRow,
    activeCol,
    setActive,
    getItemProps: <T extends HTMLElement>(row: number, col: number, _ref: RefObject<T | null>) => {
      const isActive = activeRow === row && activeCol === col;
      return {
        tabIndex: (isActive ? 0 : -1) as 0 | -1,
        isActive,
        onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => onItemKeyDown(e, row, col),
        onFocus: () => setActive(row, col),
      };
    },
  };
}
