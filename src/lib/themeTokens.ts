/*
 * Theme palette runtime layer.
 *
 * Built-in palettes (`default`, plus seeded variants) live as constants here.
 * Custom palettes are user-created at runtime via the Theme editor and
 * persisted to localStorage. Both kinds share the same shape: a per-mode
 * record of semantic token name -> CSS color string.
 *
 * Applied by setting CSS custom properties inline on
 * `document.documentElement` for the active mode. This wins over `:root`
 * and `html.dark` selectors in tokens.css on specificity tie. Clearing the
 * inline props falls back to the stylesheet values (= default palette).
 */
import type { ResolvedTheme } from '@/context/ThemeProvider';

export const COLOR_TOKEN_KEYS = [
  '--color-background',
  '--color-surface',
  '--color-surface-muted',
  '--color-surface-elevated',
  '--color-foreground',
  '--color-foreground-muted',
  '--color-foreground-subtle',
  '--color-border',
  '--color-border-strong',
  '--color-ring',
  '--color-primary',
  '--color-primary-foreground',
  '--color-secondary',
  '--color-secondary-foreground',
  '--color-success',
  '--color-success-foreground',
  '--color-warning',
  '--color-warning-foreground',
  '--color-danger',
  '--color-danger-foreground',
  '--color-info',
  '--color-info-foreground',
] as const;

export type ColorTokenKey = (typeof COLOR_TOKEN_KEYS)[number];

export type TokenMap = Record<ColorTokenKey, string>;

export const FONT_TOKEN_KEYS = [
  '--font-sans',
  '--font-serif',
  '--font-mono',
  '--font-heading',
] as const;

export type FontTokenKey = (typeof FONT_TOKEN_KEYS)[number];

export type FontMap = Partial<Record<FontTokenKey, string>>;

export interface PaletteModes {
  light: TokenMap;
  dark: TokenMap;
}

export interface Palette extends PaletteModes {
  id: string;
  name: string;
  builtIn: boolean;
}

export type TokenGroupId =
  | 'surface'
  | 'foreground'
  | 'border'
  | 'focus'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface TokenGroup {
  id: TokenGroupId;
  labelKey: string;
  keys: ReadonlyArray<ColorTokenKey>;
}

export const TOKEN_GROUPS: ReadonlyArray<TokenGroup> = [
  {
    id: 'surface',
    labelKey: 'theme.group.surface',
    keys: [
      '--color-background',
      '--color-surface',
      '--color-surface-muted',
      '--color-surface-elevated',
    ],
  },
  {
    id: 'foreground',
    labelKey: 'theme.group.foreground',
    keys: ['--color-foreground', '--color-foreground-muted', '--color-foreground-subtle'],
  },
  {
    id: 'border',
    labelKey: 'theme.group.border',
    keys: ['--color-border', '--color-border-strong'],
  },
  { id: 'focus', labelKey: 'theme.group.focus', keys: ['--color-ring'] },
  {
    id: 'primary',
    labelKey: 'theme.group.primary',
    keys: ['--color-primary', '--color-primary-foreground'],
  },
  {
    id: 'secondary',
    labelKey: 'theme.group.secondary',
    keys: ['--color-secondary', '--color-secondary-foreground'],
  },
  {
    id: 'success',
    labelKey: 'theme.group.success',
    keys: ['--color-success', '--color-success-foreground'],
  },
  {
    id: 'warning',
    labelKey: 'theme.group.warning',
    keys: ['--color-warning', '--color-warning-foreground'],
  },
  {
    id: 'danger',
    labelKey: 'theme.group.danger',
    keys: ['--color-danger', '--color-danger-foreground'],
  },
  {
    id: 'info',
    labelKey: 'theme.group.info',
    keys: ['--color-info', '--color-info-foreground'],
  },
];

/* ============================================================ */
/* Built-in palettes (mirrors src/styles/tokens.css verbatim).  */
/* Keep in sync if tokens.css changes.                          */
/* ============================================================ */

const DEFAULT_LIGHT: TokenMap = {
  '--color-background': 'hsl(210 20% 98%)',
  '--color-surface': 'hsl(0 0% 100%)',
  '--color-surface-muted': 'hsl(210 16% 95%)',
  '--color-surface-elevated': 'hsl(0 0% 100%)',
  '--color-foreground': 'hsl(222 47% 11%)',
  '--color-foreground-muted': 'hsl(215 16% 35%)',
  '--color-foreground-subtle': 'hsl(215 14% 50%)',
  '--color-border': 'hsl(214 20% 88%)',
  '--color-border-strong': 'hsl(214 16% 76%)',
  '--color-ring': 'hsl(238 75% 60%)',
  '--color-primary': 'hsl(238 75% 58%)',
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-secondary': 'hsl(215 16% 35%)',
  '--color-secondary-foreground': 'hsl(0 0% 100%)',
  '--color-success': 'hsl(152 65% 38%)',
  '--color-success-foreground': 'hsl(0 0% 100%)',
  '--color-warning': 'hsl(35 92% 48%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 50%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 48%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const DEFAULT_DARK: TokenMap = {
  '--color-background': 'hsl(0 0% 9%)',
  '--color-surface': 'hsl(0 0% 11%)',
  '--color-surface-muted': 'hsl(0 0% 14%)',
  '--color-surface-elevated': 'hsl(0 0% 17%)',
  '--color-foreground': 'hsl(0 0% 96%)',
  '--color-foreground-muted': 'hsl(0 0% 65%)',
  '--color-foreground-subtle': 'hsl(0 0% 49%)',
  '--color-border': 'hsl(0 0% 22%)',
  '--color-border-strong': 'hsl(0 0% 30%)',
  '--color-ring': 'hsl(238 90% 70%)',
  '--color-primary': 'hsl(238 85% 66%)',
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-secondary': 'hsl(0 0% 75%)',
  '--color-secondary-foreground': 'hsl(0 0% 11%)',
  '--color-success': 'hsl(152 60% 45%)',
  '--color-success-foreground': 'hsl(0 0% 100%)',
  '--color-warning': 'hsl(35 92% 55%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 58%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 55%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const TEAL_LIGHT: TokenMap = {
  '--color-background': 'hsl(178 40% 97%)',
  '--color-surface': 'hsl(178 35% 99%)',
  '--color-surface-muted': 'hsl(178 45% 91%)',
  '--color-surface-elevated': 'hsl(178 35% 99%)',
  '--color-foreground': 'hsl(180 45% 10%)',
  '--color-foreground-muted': 'hsl(180 22% 30%)',
  '--color-foreground-subtle': 'hsl(180 18% 46%)',
  '--color-border': 'hsl(178 40% 80%)',
  '--color-border-strong': 'hsl(178 35% 62%)',
  '--color-ring': 'hsl(173 80% 36%)',
  '--color-primary': 'hsl(173 80% 36%)',
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-secondary': 'hsl(180 22% 30%)',
  '--color-secondary-foreground': 'hsl(0 0% 100%)',
  '--color-success': 'hsl(152 65% 38%)',
  '--color-success-foreground': 'hsl(0 0% 100%)',
  '--color-warning': 'hsl(35 92% 48%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 50%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 48%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const TEAL_DARK: TokenMap = {
  '--color-background': 'hsl(185 35% 8%)',
  '--color-surface': 'hsl(185 32% 11%)',
  '--color-surface-muted': 'hsl(185 28% 16%)',
  '--color-surface-elevated': 'hsl(185 28% 20%)',
  '--color-foreground': 'hsl(178 30% 95%)',
  '--color-foreground-muted': 'hsl(178 18% 70%)',
  '--color-foreground-subtle': 'hsl(178 15% 54%)',
  '--color-border': 'hsl(185 25% 26%)',
  '--color-border-strong': 'hsl(185 25% 38%)',
  '--color-ring': 'hsl(172 66% 50%)',
  '--color-primary': 'hsl(172 66% 50%)',
  '--color-primary-foreground': 'hsl(180 100% 6%)',
  '--color-secondary': 'hsl(178 20% 78%)',
  '--color-secondary-foreground': 'hsl(185 35% 11%)',
  '--color-success': 'hsl(152 60% 50%)',
  '--color-success-foreground': 'hsl(150 80% 8%)',
  '--color-warning': 'hsl(35 92% 60%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 60%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 60%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const ROSE_LIGHT: TokenMap = {
  '--color-background': 'hsl(350 60% 98%)',
  '--color-surface': 'hsl(350 55% 99%)',
  '--color-surface-muted': 'hsl(350 65% 93%)',
  '--color-surface-elevated': 'hsl(350 55% 99%)',
  '--color-foreground': 'hsl(346 45% 14%)',
  '--color-foreground-muted': 'hsl(346 25% 35%)',
  '--color-foreground-subtle': 'hsl(346 20% 50%)',
  '--color-border': 'hsl(350 55% 84%)',
  '--color-border-strong': 'hsl(350 50% 68%)',
  '--color-ring': 'hsl(346 77% 49%)',
  '--color-primary': 'hsl(346 77% 49%)',
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-secondary': 'hsl(346 25% 35%)',
  '--color-secondary-foreground': 'hsl(0 0% 100%)',
  '--color-success': 'hsl(152 65% 38%)',
  '--color-success-foreground': 'hsl(0 0% 100%)',
  '--color-warning': 'hsl(35 92% 48%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 75% 48%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 48%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const ROSE_DARK: TokenMap = {
  '--color-background': 'hsl(346 30% 8%)',
  '--color-surface': 'hsl(346 28% 11%)',
  '--color-surface-muted': 'hsl(346 24% 17%)',
  '--color-surface-elevated': 'hsl(346 24% 21%)',
  '--color-foreground': 'hsl(350 30% 96%)',
  '--color-foreground-muted': 'hsl(350 18% 72%)',
  '--color-foreground-subtle': 'hsl(350 14% 56%)',
  '--color-border': 'hsl(346 22% 28%)',
  '--color-border-strong': 'hsl(346 22% 40%)',
  '--color-ring': 'hsl(346 85% 65%)',
  '--color-primary': 'hsl(346 85% 65%)',
  '--color-primary-foreground': 'hsl(346 100% 8%)',
  '--color-secondary': 'hsl(350 20% 78%)',
  '--color-secondary-foreground': 'hsl(346 30% 11%)',
  '--color-success': 'hsl(152 60% 52%)',
  '--color-success-foreground': 'hsl(150 80% 8%)',
  '--color-warning': 'hsl(35 92% 60%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 75% 62%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 60%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

/* ------------------------------------------------------------ */
/* Claude — warm cream + coral accent. Serif headings.          */
/* Fonts list common claude.ai brand names first; OSS + system  */
/* fallbacks cover the case where the brand font isn't loaded.  */
/* ------------------------------------------------------------ */

const CLAUDE_LIGHT: TokenMap = {
  '--color-background': 'hsl(48 33% 97%)',
  '--color-surface': 'hsl(0 0% 100%)',
  '--color-surface-muted': 'hsl(45 22% 96%)',
  '--color-surface-elevated': 'hsl(0 0% 100%)',
  '--color-foreground': 'hsl(30 10% 13%)',
  '--color-foreground-muted': 'hsl(30 8% 35%)',
  '--color-foreground-subtle': 'hsl(30 8% 50%)',
  '--color-border': 'hsl(38 20% 86%)',
  '--color-border-strong': 'hsl(38 18% 70%)',
  '--color-ring': 'hsl(13 55% 53%)',
  '--color-primary': 'hsl(13 55% 53%)',
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-secondary': 'hsl(30 8% 35%)',
  '--color-secondary-foreground': 'hsl(40 30% 98%)',
  '--color-success': 'hsl(152 55% 38%)',
  '--color-success-foreground': 'hsl(0 0% 100%)',
  '--color-warning': 'hsl(35 90% 48%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 65% 50%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(200 70% 45%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const CLAUDE_DARK: TokenMap = {
  '--color-background': 'hsl(30 8% 10%)',
  '--color-surface': 'hsl(30 8% 13%)',
  '--color-surface-muted': 'hsl(30 7% 18%)',
  '--color-surface-elevated': 'hsl(30 7% 22%)',
  '--color-foreground': 'hsl(40 20% 92%)',
  '--color-foreground-muted': 'hsl(40 10% 70%)',
  '--color-foreground-subtle': 'hsl(40 8% 55%)',
  '--color-border': 'hsl(30 8% 22%)',
  '--color-border-strong': 'hsl(30 8% 35%)',
  '--color-ring': 'hsl(13 65% 62%)',
  '--color-primary': 'hsl(13 60% 60%)',
  '--color-primary-foreground': 'hsl(13 80% 8%)',
  '--color-secondary': 'hsl(40 12% 75%)',
  '--color-secondary-foreground': 'hsl(30 8% 13%)',
  '--color-success': 'hsl(152 55% 52%)',
  '--color-success-foreground': 'hsl(150 80% 8%)',
  '--color-warning': 'hsl(35 92% 60%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 65% 60%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(200 70% 58%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

/* ------------------------------------------------------------ */
/* Forest — deep forest green primary, sage surfaces.           */
/* ------------------------------------------------------------ */

const FOREST_LIGHT: TokenMap = {
  '--color-background': 'hsl(48 26% 96%)',
  '--color-surface': 'hsl(48 24% 98%)',
  '--color-surface-muted': 'hsl(48 22% 91%)',
  '--color-surface-elevated': 'hsl(48 24% 98%)',
  '--color-foreground': 'hsl(150 40% 10%)',
  '--color-foreground-muted': 'hsl(150 18% 30%)',
  '--color-foreground-subtle': 'hsl(150 14% 46%)',
  '--color-border': 'hsl(48 18% 82%)',
  '--color-border-strong': 'hsl(80 16% 60%)',
  '--color-ring': 'hsl(148 60% 32%)',
  '--color-primary': 'hsl(148 55% 30%)',
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-secondary': 'hsl(150 18% 30%)',
  '--color-secondary-foreground': 'hsl(0 0% 100%)',
  '--color-success': 'hsl(152 65% 38%)',
  '--color-success-foreground': 'hsl(0 0% 100%)',
  '--color-warning': 'hsl(35 92% 48%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 50%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 48%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const FOREST_DARK: TokenMap = {
  '--color-background': 'hsl(150 25% 7%)',
  '--color-surface': 'hsl(150 22% 10%)',
  '--color-surface-muted': 'hsl(150 20% 14%)',
  '--color-surface-elevated': 'hsl(150 20% 18%)',
  '--color-foreground': 'hsl(120 25% 95%)',
  '--color-foreground-muted': 'hsl(120 14% 70%)',
  '--color-foreground-subtle': 'hsl(120 12% 54%)',
  '--color-border': 'hsl(150 18% 24%)',
  '--color-border-strong': 'hsl(150 18% 36%)',
  '--color-ring': 'hsl(145 60% 55%)',
  '--color-primary': 'hsl(145 55% 50%)',
  '--color-primary-foreground': 'hsl(150 100% 6%)',
  '--color-secondary': 'hsl(120 18% 76%)',
  '--color-secondary-foreground': 'hsl(150 25% 10%)',
  '--color-success': 'hsl(152 60% 50%)',
  '--color-success-foreground': 'hsl(150 80% 8%)',
  '--color-warning': 'hsl(35 92% 60%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 60%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 60%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

/* ------------------------------------------------------------ */
/* Mono — pure grayscale neutrals + black/white primary. Keeps   */
/* semantic accents (success/warning/danger/info) hued so alerts */
/* stay distinguishable.                                         */
/* ------------------------------------------------------------ */

const MONO_LIGHT: TokenMap = {
  '--color-background': 'hsl(0 0% 100%)',
  '--color-surface': 'hsl(0 0% 100%)',
  '--color-surface-muted': 'hsl(0 0% 96%)',
  '--color-surface-elevated': 'hsl(0 0% 100%)',
  '--color-foreground': 'hsl(0 0% 9%)',
  '--color-foreground-muted': 'hsl(0 0% 35%)',
  '--color-foreground-subtle': 'hsl(0 0% 50%)',
  '--color-border': 'hsl(0 0% 88%)',
  '--color-border-strong': 'hsl(0 0% 70%)',
  '--color-ring': 'hsl(0 0% 9%)',
  '--color-primary': 'hsl(0 0% 9%)',
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-secondary': 'hsl(0 0% 35%)',
  '--color-secondary-foreground': 'hsl(0 0% 100%)',
  '--color-success': 'hsl(152 65% 38%)',
  '--color-success-foreground': 'hsl(0 0% 100%)',
  '--color-warning': 'hsl(35 92% 48%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 50%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 48%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

const MONO_DARK: TokenMap = {
  '--color-background': 'hsl(0 0% 7%)',
  '--color-surface': 'hsl(0 0% 10%)',
  '--color-surface-muted': 'hsl(0 0% 14%)',
  '--color-surface-elevated': 'hsl(0 0% 17%)',
  '--color-foreground': 'hsl(0 0% 96%)',
  '--color-foreground-muted': 'hsl(0 0% 68%)',
  '--color-foreground-subtle': 'hsl(0 0% 52%)',
  '--color-border': 'hsl(0 0% 22%)',
  '--color-border-strong': 'hsl(0 0% 34%)',
  '--color-ring': 'hsl(0 0% 96%)',
  '--color-primary': 'hsl(0 0% 96%)',
  '--color-primary-foreground': 'hsl(0 0% 9%)',
  '--color-secondary': 'hsl(0 0% 70%)',
  '--color-secondary-foreground': 'hsl(0 0% 9%)',
  '--color-success': 'hsl(152 60% 50%)',
  '--color-success-foreground': 'hsl(150 80% 8%)',
  '--color-warning': 'hsl(35 92% 60%)',
  '--color-warning-foreground': 'hsl(40 100% 10%)',
  '--color-danger': 'hsl(0 72% 60%)',
  '--color-danger-foreground': 'hsl(0 0% 100%)',
  '--color-info': 'hsl(199 89% 60%)',
  '--color-info-foreground': 'hsl(0 0% 100%)',
};

export const BUILT_IN_PALETTES: ReadonlyArray<Palette> = [
  {
    id: 'default',
    name: 'Default (Indigo)',
    builtIn: true,
    light: DEFAULT_LIGHT,
    dark: DEFAULT_DARK,
  },
  { id: 'teal', name: 'Teal', builtIn: true, light: TEAL_LIGHT, dark: TEAL_DARK },
  { id: 'rose', name: 'Rose', builtIn: true, light: ROSE_LIGHT, dark: ROSE_DARK },
  { id: 'forest', name: 'Forest', builtIn: true, light: FOREST_LIGHT, dark: FOREST_DARK },
  { id: 'claude', name: 'Claude', builtIn: true, light: CLAUDE_LIGHT, dark: CLAUDE_DARK },
  { id: 'mono', name: 'Mono', builtIn: true, light: MONO_LIGHT, dark: MONO_DARK },
];

export const DEFAULT_PALETTE_ID = 'default';

export function getDefaultModes(): PaletteModes {
  return { light: { ...DEFAULT_LIGHT }, dark: { ...DEFAULT_DARK } };
}

/* ============================================================ */
/* Apply / clear                                                */
/* ============================================================ */

export function applyPalette(palette: Palette, mode: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const tokens = palette[mode];
  for (const key of COLOR_TOKEN_KEYS) {
    const value = tokens[key];
    if (typeof value === 'string' && value.length > 0) {
      root.style.setProperty(key, value);
    } else {
      root.style.removeProperty(key);
    }
  }
}

export function clearPalette(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const key of COLOR_TOKEN_KEYS) {
    root.style.removeProperty(key);
  }
}

/* ============================================================ */
/* Storage                                                      */
/* ============================================================ */

const PALETTES_KEY = 'admin-template-theme-palettes';
const ACTIVE_KEY = 'admin-template-theme-palette';

function isTokenMap(value: unknown): value is TokenMap {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return COLOR_TOKEN_KEYS.every((key) => typeof obj[key] === 'string');
}

function isPalette(value: unknown): value is Palette {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.builtIn === 'boolean' &&
    isTokenMap(obj.light) &&
    isTokenMap(obj.dark)
  );
}

export function readStoredPalettes(): Palette[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PALETTES_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPalette).map((p) => ({ ...p, builtIn: false }));
  } catch {
    return [];
  }
}

export function writeStoredPalettes(palettes: ReadonlyArray<Palette>): void {
  if (typeof window === 'undefined') return;
  try {
    const persistable = palettes.filter((p) => !p.builtIn);
    window.localStorage.setItem(PALETTES_KEY, JSON.stringify(persistable));
  } catch {
    // ignore
  }
}

export function readStoredActiveId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredActiveId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // ignore
  }
}

/* ============================================================ */
/* Helpers                                                      */
/* ============================================================ */

let counter = 0;
export function newPaletteId(): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `palette-${Date.now().toString(36)}-${counter}-${rand}`;
}

export function clonePalette(source: Palette, name: string): Palette {
  return {
    id: newPaletteId(),
    name,
    builtIn: false,
    light: { ...source.light },
    dark: { ...source.dark },
  };
}

export function exportPalette(palette: Palette): string {
  const { id: _id, builtIn: _b, ...rest } = palette;
  return JSON.stringify(rest, null, 2);
}

export function importPalette(raw: string): Palette | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.name !== 'string') return null;
  if (!isTokenMap(obj.light) || !isTokenMap(obj.dark)) return null;
  return {
    id: newPaletteId(),
    name: obj.name,
    builtIn: false,
    light: obj.light,
    dark: obj.dark,
  };
}
