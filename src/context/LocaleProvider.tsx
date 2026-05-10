import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import i18n, { RTL_LOCALES, SUPPORTED_LOCALES, type SupportedLocale } from '@/i18n';

type Direction = 'ltr' | 'rtl';

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
  flag: string;
}

const LOCALE_OPTIONS: ReadonlyArray<LocaleOption> = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale) => void;
  availableLocales: ReadonlyArray<LocaleOption>;
  dir: Direction;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function normalize(raw: string | undefined): SupportedLocale {
  const head = (raw ?? 'en').toLowerCase().split('-')[0] ?? 'en';
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(head)
    ? (head as SupportedLocale)
    : 'en';
}

function dirFor(code: string): Direction {
  return RTL_LOCALES.has(code.toLowerCase().split('-')[0] ?? '') ? 'rtl' : 'ltr';
}

export interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() =>
    normalize(i18n.resolvedLanguage ?? i18n.language),
  );

  useEffect(() => {
    const onChange = (lng: string): void => {
      setLocaleState(normalize(lng));
    };
    i18n.on('languageChanged', onChange);
    return () => {
      i18n.off('languageChanged', onChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirFor(locale);
  }, [locale]);

  const setLocale = useCallback((next: SupportedLocale) => {
    void i18n.changeLanguage(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      availableLocales: LOCALE_OPTIONS,
      dir: dirFor(locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx === null) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}
