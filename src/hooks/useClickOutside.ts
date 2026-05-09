import { useEffect, useRef, type RefObject } from 'react';

export type ClickOutsideRefs<T extends HTMLElement> =
  | RefObject<T | null>
  | Array<RefObject<T | null>>;

export interface UseClickOutsideOptions {
  enabled?: boolean;
}

export function useClickOutside<T extends HTMLElement>(
  refs: ClickOutsideRefs<T>,
  handler: (event: PointerEvent) => void,
  options: UseClickOutsideOptions = {},
): void {
  const { enabled = true } = options;

  const refsRef = useRef(refs);
  const handlerRef = useRef(handler);
  useEffect(() => {
    refsRef.current = refs;
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target === null) return;
      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const inside = list.some((r) => r.current?.contains(target) === true);
      if (!inside) handlerRef.current(e);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [enabled]);
}
