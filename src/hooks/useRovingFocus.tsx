import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

export type RovingFocusOrientation = 'horizontal' | 'vertical' | 'both';

interface RovingFocusContextValue {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  register: (index: number, getEl: () => HTMLElement | null) => () => void;
  onItemKeyDown: (e: ReactKeyboardEvent<HTMLElement>, index: number) => void;
}

const RovingFocusContext = createContext<RovingFocusContextValue | null>(null);

export interface RovingFocusGroupProps {
  orientation?: RovingFocusOrientation;
  loop?: boolean;
  defaultIndex?: number;
  children: ReactNode;
}

export function RovingFocusGroup({
  orientation = 'horizontal',
  loop = true,
  defaultIndex = 0,
  children,
}: RovingFocusGroupProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const itemsRef = useRef<Map<number, () => HTMLElement | null>>(new Map());

  const register = useCallback((index: number, getEl: () => HTMLElement | null) => {
    itemsRef.current.set(index, getEl);
    return () => {
      itemsRef.current.delete(index);
    };
  }, []);

  const focusAt = useCallback((index: number) => {
    const getEl = itemsRef.current.get(index);
    const el = getEl?.() ?? null;
    if (el !== null) {
      el.focus();
      setActiveIndex(index);
    }
  }, []);

  const onItemKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>, index: number) => {
      const indices = Array.from(itemsRef.current.keys()).sort((a, b) => a - b);
      if (indices.length === 0) return;
      const pos = indices.indexOf(index);
      if (pos === -1) return;

      let nextPos: number | null = null;

      if (e.key === 'Home') {
        nextPos = 0;
      } else if (e.key === 'End') {
        nextPos = indices.length - 1;
      } else if (orientation === 'both') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPos = pos + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextPos = pos - 1;
      } else if (orientation === 'horizontal') {
        if (e.key === 'ArrowRight') nextPos = pos + 1;
        else if (e.key === 'ArrowLeft') nextPos = pos - 1;
      } else if (orientation === 'vertical') {
        if (e.key === 'ArrowDown') nextPos = pos + 1;
        else if (e.key === 'ArrowUp') nextPos = pos - 1;
      }

      if (nextPos === null) return;
      e.preventDefault();

      if (loop) {
        nextPos = ((nextPos % indices.length) + indices.length) % indices.length;
      } else {
        nextPos = Math.max(0, Math.min(indices.length - 1, nextPos));
      }

      const targetIdx = indices[nextPos];
      if (targetIdx !== undefined) focusAt(targetIdx);
    },
    [orientation, loop, focusAt],
  );

  const value = useMemo<RovingFocusContextValue>(
    () => ({ activeIndex, setActiveIndex, register, onItemKeyDown }),
    [activeIndex, register, onItemKeyDown],
  );

  return <RovingFocusContext.Provider value={value}>{children}</RovingFocusContext.Provider>;
}

export interface UseRovingFocusItemReturn {
  tabIndex: 0 | -1;
  isActive: boolean;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: () => void;
}

export function useRovingFocusItem<T extends HTMLElement>(
  index: number,
  ref: RefObject<T | null>,
): UseRovingFocusItemReturn {
  const ctx = useContext(RovingFocusContext);
  if (ctx === null) {
    throw new Error('useRovingFocusItem must be used within a <RovingFocusGroup>');
  }
  const { activeIndex, setActiveIndex, register, onItemKeyDown } = ctx;

  useEffect(() => register(index, () => ref.current), [register, index, ref]);

  const isActive = activeIndex === index;
  return {
    tabIndex: isActive ? 0 : -1,
    isActive,
    onKeyDown: (e) => onItemKeyDown(e, index),
    onFocus: () => setActiveIndex(index),
  };
}
