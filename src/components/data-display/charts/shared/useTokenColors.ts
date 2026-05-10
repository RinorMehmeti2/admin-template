import { useEffect, useState } from 'react';
import type { ChartColorName } from './types';

/**
 * Resolved CSS colour values for the palette tokens.
 *
 * Recharts serialises some colours into computed gradients / interpolation
 * paths where `var(--…)` references break. Resolving them once via
 * getComputedStyle on a sentinel element gives us real colour strings that
 * work in every Recharts code path.
 *
 * Re-resolves on `<html class>` mutations so theme toggles propagate.
 */

export type TokenColorMap = Record<ChartColorName, string> & {
  /** Surface / foreground tokens used by chart adornments (axis, grid, tooltip). */
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  foreground: string;
  foregroundMuted: string;
  foregroundSubtle: string;
  border: string;
  borderStrong: string;
  ring: string;
};

const FALLBACK: TokenColorMap = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0284c7',
  neutral: '#71717a',
  background: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f4f4f5',
  surfaceElevated: '#ffffff',
  foreground: '#18181b',
  foregroundMuted: '#52525b',
  foregroundSubtle: '#a1a1aa',
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',
  ring: '#2563eb',
};

const TOKEN_VARS: Record<keyof TokenColorMap, string> = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  success: '--color-success',
  warning: '--color-warning',
  danger: '--color-danger',
  info: '--color-info',
  neutral: '--color-foreground-subtle',
  background: '--color-background',
  surface: '--color-surface',
  surfaceMuted: '--color-surface-muted',
  surfaceElevated: '--color-surface-elevated',
  foreground: '--color-foreground',
  foregroundMuted: '--color-foreground-muted',
  foregroundSubtle: '--color-foreground-subtle',
  border: '--color-border',
  borderStrong: '--color-border-strong',
  ring: '--color-ring',
};

function readColors(sentinel: HTMLElement): TokenColorMap {
  const computed = window.getComputedStyle(sentinel);
  const out = { ...FALLBACK };
  (Object.keys(TOKEN_VARS) as ReadonlyArray<keyof TokenColorMap>).forEach((key) => {
    const raw = computed.getPropertyValue(TOKEN_VARS[key]).trim();
    if (raw !== '') out[key] = raw;
  });
  return out;
}

export function useTokenColors(): TokenColorMap {
  const [colors, setColors] = useState<TokenColorMap>(FALLBACK);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const sentinel = document.createElement('div');
    // Hidden but inserted so getComputedStyle returns the resolved CSS vars.
    sentinel.style.position = 'absolute';
    sentinel.style.left = '-9999px';
    sentinel.style.top = '-9999px';
    sentinel.style.width = '1px';
    sentinel.style.height = '1px';
    sentinel.style.pointerEvents = 'none';
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.dataset.chartColorSentinel = 'true';
    document.body.appendChild(sentinel);

    const refresh = (): void => {
      setColors(readColors(sentinel));
    };
    refresh();

    // Re-read whenever the theme class on <html> changes.
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  return colors;
}
