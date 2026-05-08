import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

export interface UseFocusTrapOptions {
  active: boolean;
  initialFocus?: 'first' | 'container' | RefObject<HTMLElement | null>;
  returnFocus?: boolean;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const all = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return all.filter(
    (el) =>
      !el.hasAttribute('data-focus-trap-ignore') &&
      el.closest('[data-focus-trap-ignore]') === null,
  );
}

export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseFocusTrapOptions,
): void {
  const { active, initialFocus = 'first', returnFocus = true } = options;
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const hadTabindex = container.hasAttribute('tabindex');
    if (!hadTabindex) container.setAttribute('tabindex', '-1');

    const focusables = getFocusable(container);
    if (initialFocus === 'first') {
      (focusables[0] ?? container).focus();
    } else if (initialFocus === 'container') {
      container.focus();
    } else {
      const target = initialFocus.current;
      (target ?? focusables[0] ?? container).focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const current = getFocusable(container);
      if (current.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = current[0]!;
      const last = current[current.length - 1]!;
      const activeEl = document.activeElement as HTMLElement | null;
      const inside = activeEl !== null && container.contains(activeEl);

      if (e.shiftKey) {
        if (!inside || activeEl === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!inside || activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (!hadTabindex) container.removeAttribute('tabindex');
      if (returnFocus) {
        const prev = previouslyFocusedRef.current;
        if (prev !== null && document.contains(prev) && typeof prev.focus === 'function') {
          prev.focus();
        }
      }
    };
  }, [active, ref, initialFocus, returnFocus]);
}
