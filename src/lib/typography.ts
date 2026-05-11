/*
 * Typography runtime layer — orthogonal to palette.
 *
 * Controls font families (sans / serif / mono / heading) and a global scale
 * factor applied to the root font-size. All Tailwind sizing is rem-based,
 * so adjusting root font-size scales every text + spacing token
 * proportionally (Compact vs Comfortable).
 *
 * Built-in presets use only fonts that the operating system already
 * provides — system stacks, Georgia, Consolas/Menlo — so changes are
 * visible without installing or fetching anything.
 */

import { FONT_TOKEN_KEYS, type FontTokenKey } from './themeTokens';

export type { FontTokenKey };

export type FontMap = Partial<Record<FontTokenKey, string>>;

export interface TypographyConfig {
  id: string;
  name: string;
  builtIn: boolean;
  fonts: FontMap;
  /** Multiplier on root font-size. 1 = 16px (default). Range 0.85–1.20. */
  scale: number;
}

export const TYPOGRAPHY_SCALE_MIN = 0.85;
export const TYPOGRAPHY_SCALE_MAX = 1.2;
export const TYPOGRAPHY_SCALE_DEFAULT = 1;

/* ============================================================ */
/* Stacks                                                       */
/* ============================================================ */

const SYSTEM_SANS =
  "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const SYSTEM_SERIF =
  "ui-serif, Georgia, 'Iowan Old Style', 'Apple Garamond', Baskerville, 'Times New Roman', serif";
const SYSTEM_MONO =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

/* Fonts that exist on most installs of Windows / macOS / Linux without
   any external CSS or font file. Use these in presets so users see a
   visible difference immediately. */
const GEORGIA_STACK =
  "Georgia, 'Iowan Old Style', 'Apple Garamond', Baskerville, 'Times New Roman', serif";
const TIMES_STACK = "'Times New Roman', Times, serif";
const VERDANA_STACK = 'Verdana, Geneva, Tahoma, sans-serif';
const TREBUCHET_STACK = "'Trebuchet MS', 'Lucida Sans', sans-serif";
const CONSOLAS_STACK = "Consolas, Menlo, Monaco, 'Courier New', monospace";

/* ============================================================ */
/* Built-in presets                                             */
/* ============================================================ */

export const BUILT_IN_TYPOGRAPHIES: ReadonlyArray<TypographyConfig> = [
  {
    id: 'system',
    name: 'System default',
    builtIn: true,
    fonts: {
      '--font-sans': SYSTEM_SANS,
      '--font-serif': SYSTEM_SERIF,
      '--font-mono': SYSTEM_MONO,
      '--font-heading': SYSTEM_SANS,
    },
    scale: 1,
  },
  {
    id: 'compact',
    name: 'Compact',
    builtIn: true,
    fonts: {
      '--font-sans': SYSTEM_SANS,
      '--font-serif': SYSTEM_SERIF,
      '--font-mono': SYSTEM_MONO,
      '--font-heading': SYSTEM_SANS,
    },
    scale: 0.9,
  },
  {
    id: 'comfortable',
    name: 'Comfortable',
    builtIn: true,
    fonts: {
      '--font-sans': SYSTEM_SANS,
      '--font-serif': SYSTEM_SERIF,
      '--font-mono': SYSTEM_MONO,
      '--font-heading': SYSTEM_SANS,
    },
    scale: 1.1,
  },
  {
    id: 'serif-heading',
    name: 'Serif headings',
    builtIn: true,
    fonts: {
      '--font-sans': SYSTEM_SANS,
      '--font-serif': GEORGIA_STACK,
      '--font-mono': SYSTEM_MONO,
      '--font-heading': GEORGIA_STACK,
    },
    scale: 1,
  },
  {
    id: 'editorial',
    name: 'Editorial (full serif)',
    builtIn: true,
    fonts: {
      '--font-sans': GEORGIA_STACK,
      '--font-serif': TIMES_STACK,
      '--font-mono': CONSOLAS_STACK,
      '--font-heading': GEORGIA_STACK,
    },
    scale: 1,
  },
  {
    id: 'humanist',
    name: 'Humanist sans',
    builtIn: true,
    fonts: {
      '--font-sans': TREBUCHET_STACK,
      '--font-serif': GEORGIA_STACK,
      '--font-mono': CONSOLAS_STACK,
      '--font-heading': TREBUCHET_STACK,
    },
    scale: 1,
  },
  {
    id: 'screen',
    name: 'Screen-optimized (Verdana)',
    builtIn: true,
    fonts: {
      '--font-sans': VERDANA_STACK,
      '--font-serif': GEORGIA_STACK,
      '--font-mono': CONSOLAS_STACK,
      '--font-heading': VERDANA_STACK,
    },
    scale: 1,
  },
  {
    id: 'mono',
    name: 'Mono everywhere',
    builtIn: true,
    fonts: {
      '--font-sans': CONSOLAS_STACK,
      '--font-serif': CONSOLAS_STACK,
      '--font-mono': CONSOLAS_STACK,
      '--font-heading': CONSOLAS_STACK,
    },
    scale: 0.95,
  },
];

export const DEFAULT_TYPOGRAPHY_ID = 'system';

/* ============================================================ */
/* Apply / clear                                                */
/* ============================================================ */

export function applyTypography(config: TypographyConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const key of FONT_TOKEN_KEYS) {
    const v = config.fonts[key];
    if (typeof v === 'string' && v.length > 0) {
      root.style.setProperty(key, v);
    } else {
      root.style.removeProperty(key);
    }
  }
  const pct = Math.max(TYPOGRAPHY_SCALE_MIN, Math.min(TYPOGRAPHY_SCALE_MAX, config.scale));
  // Root font-size: 16px is the browser default. Multiplying scales every
  // rem-based size used by Tailwind (text-*, p-*, h-*, etc.).
  root.style.fontSize = `${pct * 100}%`;
}

export function clearTypography(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const key of FONT_TOKEN_KEYS) {
    root.style.removeProperty(key);
  }
  root.style.fontSize = '';
}

/* ============================================================ */
/* Storage                                                      */
/* ============================================================ */

const STORE_LIST_KEY = 'admin-template-typographies';
const STORE_ACTIVE_KEY = 'admin-template-typography';

function isFontMap(value: unknown): value is FontMap {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  for (const key of FONT_TOKEN_KEYS) {
    const v = obj[key];
    if (v !== undefined && typeof v !== 'string') return false;
  }
  return true;
}

function isTypographyConfig(value: unknown): value is TypographyConfig {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.builtIn === 'boolean' &&
    typeof obj.scale === 'number' &&
    isFontMap(obj.fonts)
  );
}

export function readStoredTypographies(): TypographyConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORE_LIST_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTypographyConfig).map((c) => ({ ...c, builtIn: false }));
  } catch {
    return [];
  }
}

export function writeStoredTypographies(configs: ReadonlyArray<TypographyConfig>): void {
  if (typeof window === 'undefined') return;
  try {
    const persistable = configs.filter((c) => !c.builtIn);
    window.localStorage.setItem(STORE_LIST_KEY, JSON.stringify(persistable));
  } catch {
    // ignore
  }
}

export function readStoredActiveTypographyId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORE_ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredActiveTypographyId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_ACTIVE_KEY, id);
  } catch {
    // ignore
  }
}

/* ============================================================ */
/* Helpers                                                      */
/* ============================================================ */

let counter = 0;
export function newTypographyId(): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `typo-${Date.now().toString(36)}-${counter}-${rand}`;
}

export function cloneTypography(source: TypographyConfig, name: string): TypographyConfig {
  return {
    id: newTypographyId(),
    name,
    builtIn: false,
    fonts: { ...source.fonts },
    scale: source.scale,
  };
}
