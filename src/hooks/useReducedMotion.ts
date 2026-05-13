import { useMediaQuery } from './useMediaQuery';

/**
 * Returns true when the user has requested reduced motion via OS settings.
 * Components should branch off this to skip non-essential entrance/exit
 * animations (functional spinners stay). SSR-safe — returns false on first
 * server render, hydrates correctly.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
