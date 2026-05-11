import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  applyPalette,
  BUILT_IN_PALETTES,
  clonePalette,
  DEFAULT_PALETTE_ID,
  newPaletteId,
  readStoredActiveId,
  readStoredPalettes,
  writeStoredActiveId,
  writeStoredPalettes,
  type ColorTokenKey,
  type Palette,
} from '@/lib/themeTokens';
import {
  applyTypography,
  BUILT_IN_TYPOGRAPHIES,
  cloneTypography,
  DEFAULT_TYPOGRAPHY_ID,
  newTypographyId,
  readStoredActiveTypographyId,
  readStoredTypographies,
  writeStoredActiveTypographyId,
  writeStoredTypographies,
  type FontTokenKey,
  type TypographyConfig,
} from '@/lib/typography';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'admin-template-theme';

interface ThemeContextValue {
  /** light / dark / system — affects which mode of the palette renders. */
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;

  /** All palettes (built-in first, then custom). */
  palettes: ReadonlyArray<Palette>;
  /** Active palette id. */
  paletteId: string;
  /** Resolved active palette (always defined; falls back to default). */
  activePalette: Palette;
  setPaletteId: (id: string) => void;

  /** CRUD on custom palettes. Built-in palettes cannot be mutated. */
  createPalette: (name: string, source?: Palette) => Palette;
  updatePalette: (id: string, patch: Partial<Pick<Palette, 'name'>> & {
    light?: Partial<Record<ColorTokenKey, string>>;
    dark?: Partial<Record<ColorTokenKey, string>>;
  }) => void;
  duplicatePalette: (id: string, name?: string) => Palette | null;
  deletePalette: (id: string) => void;
  importPalette: (palette: Palette) => Palette;

  /* ---------- Typography (font family + scale) ---------- */

  typographies: ReadonlyArray<TypographyConfig>;
  typographyId: string;
  activeTypography: TypographyConfig;
  setTypographyId: (id: string) => void;
  createTypography: (name: string, source?: TypographyConfig) => TypographyConfig;
  updateTypography: (
    id: string,
    patch: Partial<Pick<TypographyConfig, 'name' | 'scale'>> & {
      fonts?: Partial<Record<FontTokenKey, string>>;
    },
  ) => void;
  duplicateTypography: (id: string, name?: string) => TypographyConfig | null;
  deleteTypography: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // localStorage unavailable — fall through.
  }
  return 'system';
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = readStoredTheme();
    return stored ?? defaultTheme;
  });
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  const [customPalettes, setCustomPalettes] = useState<ReadonlyArray<Palette>>(() =>
    readStoredPalettes(),
  );
  const palettes = useMemo<ReadonlyArray<Palette>>(
    () => [...BUILT_IN_PALETTES, ...customPalettes],
    [customPalettes],
  );

  const [paletteId, setPaletteIdState] = useState<string>(() => {
    const stored = readStoredActiveId();
    return stored ?? DEFAULT_PALETTE_ID;
  });

  const activePalette = useMemo<Palette>(() => {
    const found = palettes.find((p) => p.id === paletteId);
    if (found !== undefined) return found;
    return BUILT_IN_PALETTES[0]!;
  }, [palettes, paletteId]);

  /* ---------- Typography state ---------- */

  const [customTypographies, setCustomTypographies] = useState<ReadonlyArray<TypographyConfig>>(
    () => readStoredTypographies(),
  );
  const typographies = useMemo<ReadonlyArray<TypographyConfig>>(
    () => [...BUILT_IN_TYPOGRAPHIES, ...customTypographies],
    [customTypographies],
  );
  const [typographyId, setTypographyIdState] = useState<string>(() => {
    const stored = readStoredActiveTypographyId();
    return stored ?? DEFAULT_TYPOGRAPHY_ID;
  });
  const activeTypography = useMemo<TypographyConfig>(() => {
    const found = typographies.find((c) => c.id === typographyId);
    if (found !== undefined) return found;
    return BUILT_IN_TYPOGRAPHIES[0]!;
  }, [typographies, typographyId]);

  // Apply mode (dark class + colorScheme) AND custom-property overrides.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.style.colorScheme = resolvedTheme;
    applyPalette(activePalette, resolvedTheme);
  }, [resolvedTheme, activePalette]);

  useEffect(() => {
    applyTypography(activeTypography);
  }, [activeTypography]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const setPaletteId = useCallback((id: string) => {
    setPaletteIdState(id);
    writeStoredActiveId(id);
  }, []);

  const persistCustom = useCallback((next: ReadonlyArray<Palette>) => {
    setCustomPalettes(next);
    writeStoredPalettes(next);
  }, []);

  const createPalette = useCallback(
    (name: string, source?: Palette) => {
      const base = source ?? BUILT_IN_PALETTES[0]!;
      const fresh = clonePalette(base, name);
      persistCustom([...customPalettes, fresh]);
      return fresh;
    },
    [customPalettes, persistCustom],
  );

  const updatePalette = useCallback<ThemeContextValue['updatePalette']>(
    (id, patch) => {
      const next = customPalettes.map((p): Palette => {
        if (p.id !== id) return p;
        const lightPatch = patch.light;
        const darkPatch = patch.dark;
        return {
          ...p,
          name: patch.name ?? p.name,
          light: lightPatch !== undefined ? { ...p.light, ...lightPatch } : p.light,
          dark: darkPatch !== undefined ? { ...p.dark, ...darkPatch } : p.dark,
        };
      });
      persistCustom(next);
    },
    [customPalettes, persistCustom],
  );

  const duplicatePalette = useCallback(
    (id: string, name?: string) => {
      const source = palettes.find((p) => p.id === id);
      if (source === undefined) return null;
      const copy = clonePalette(source, name ?? `${source.name} copy`);
      persistCustom([...customPalettes, copy]);
      return copy;
    },
    [palettes, customPalettes, persistCustom],
  );

  const deletePalette = useCallback(
    (id: string) => {
      const target = customPalettes.find((p) => p.id === id);
      if (target === undefined) return;
      persistCustom(customPalettes.filter((p) => p.id !== id));
      if (paletteId === id) setPaletteId(DEFAULT_PALETTE_ID);
    },
    [customPalettes, persistCustom, paletteId, setPaletteId],
  );

  const importPaletteFn = useCallback(
    (palette: Palette) => {
      const fresh: Palette = { ...palette, id: newPaletteId(), builtIn: false };
      persistCustom([...customPalettes, fresh]);
      return fresh;
    },
    [customPalettes, persistCustom],
  );

  /* ---------- Typography CRUD ---------- */

  const setTypographyId = useCallback((id: string) => {
    setTypographyIdState(id);
    writeStoredActiveTypographyId(id);
  }, []);

  const persistTypographies = useCallback((next: ReadonlyArray<TypographyConfig>) => {
    setCustomTypographies(next);
    writeStoredTypographies(next);
  }, []);

  const createTypography = useCallback(
    (name: string, source?: TypographyConfig) => {
      const base = source ?? BUILT_IN_TYPOGRAPHIES[0]!;
      const fresh = cloneTypography(base, name);
      persistTypographies([...customTypographies, fresh]);
      return fresh;
    },
    [customTypographies, persistTypographies],
  );

  const updateTypography = useCallback<ThemeContextValue['updateTypography']>(
    (id, patch) => {
      const next = customTypographies.map((c): TypographyConfig => {
        if (c.id !== id) return c;
        return {
          ...c,
          name: patch.name ?? c.name,
          scale: patch.scale ?? c.scale,
          fonts: patch.fonts !== undefined ? { ...c.fonts, ...patch.fonts } : c.fonts,
        };
      });
      persistTypographies(next);
    },
    [customTypographies, persistTypographies],
  );

  const duplicateTypography = useCallback(
    (id: string, name?: string) => {
      const source = typographies.find((c) => c.id === id);
      if (source === undefined) return null;
      const copy = cloneTypography(source, name ?? `${source.name} copy`);
      persistTypographies([...customTypographies, copy]);
      return copy;
    },
    [typographies, customTypographies, persistTypographies],
  );

  const deleteTypography = useCallback(
    (id: string) => {
      const target = customTypographies.find((c) => c.id === id);
      if (target === undefined) return;
      persistTypographies(customTypographies.filter((c) => c.id !== id));
      if (typographyId === id) setTypographyId(DEFAULT_TYPOGRAPHY_ID);
    },
    [customTypographies, persistTypographies, typographyId, setTypographyId],
  );

  // newTypographyId imported to keep the helper available; we don't call it
  // directly here because clone / create cover all id minting paths.
  void newTypographyId;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      palettes,
      paletteId,
      activePalette,
      setPaletteId,
      createPalette,
      updatePalette,
      duplicatePalette,
      deletePalette,
      importPalette: importPaletteFn,
      typographies,
      typographyId,
      activeTypography,
      setTypographyId,
      createTypography,
      updateTypography,
      duplicateTypography,
      deleteTypography,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      palettes,
      paletteId,
      activePalette,
      setPaletteId,
      createPalette,
      updatePalette,
      duplicatePalette,
      deletePalette,
      importPaletteFn,
      typographies,
      typographyId,
      activeTypography,
      setTypographyId,
      createTypography,
      updateTypography,
      duplicateTypography,
      deleteTypography,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
