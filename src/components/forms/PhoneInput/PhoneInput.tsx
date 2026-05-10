import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useId } from '@/hooks/useId';
import { useListbox } from '@/hooks/useListbox';
import { usePosition } from '@/hooks/usePosition';
import { Portal } from '@/components/overlays/Portal';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';
import {
  detectCountryFromInternational,
  formatNational,
  getCountryEntries,
  getCountryFromLocale,
  getFlagEmoji,
  isValidNational,
  parseE164,
  toE164,
  type CountryCode,
  type CountryEntry,
} from './phoneInputUtils';

const shellStyles = cva(
  'relative flex items-stretch overflow-visible rounded-md border bg-surface text-foreground transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'border-border focus-within:ring-ring',
        error: 'border-danger focus-within:ring-danger',
      },
      inputSize: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
      },
    },
    defaultVariants: { variant: 'default', inputSize: 'md' },
  },
);

export interface PhoneInputHandle {
  isValid: boolean;
  countryCode: CountryCode;
  e164: string | null;
  focus(): void;
  blur(): void;
}

export interface PhoneInputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'prefix'
    >,
    VariantProps<typeof shellStyles> {
  ref?: Ref<PhoneInputHandle>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (e164: string | null) => void;
  defaultCountry?: CountryCode;
  preferredCountries?: ReadonlyArray<CountryCode>;
  /** Visible label for the country picker button (a11y). */
  countryAriaLabel?: string;
  error?: boolean;
}

export function PhoneInput({
  ref,
  className,
  variant,
  inputSize,
  value,
  defaultValue,
  onValueChange,
  defaultCountry,
  preferredCountries,
  countryAriaLabel = 'Country',
  error,
  disabled = false,
  placeholder,
  id,
  ...rest
}: PhoneInputProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const aria = useFieldAriaProps(
    {
      id,
      'aria-describedby': rest['aria-describedby'],
      'aria-invalid': rest['aria-invalid'],
      'aria-labelledby': rest['aria-labelledby'],
    },
    error === true || variant === 'error',
  );
  const effectiveVariant = variant ?? (aria.hasError || error === true ? 'error' : 'default');
  const generatedId = useId('phone-input');
  const inputId = aria.id ?? generatedId;

  const fallbackCountry: CountryCode = defaultCountry ?? getCountryFromLocale(locale) ?? 'US';

  const initial = useMemo(() => {
    const initSource = value ?? defaultValue;
    if (initSource !== undefined && initSource !== '') {
      const parsed = parseE164(initSource);
      if (parsed !== null) return parsed;
    }
    return { country: fallbackCountry, national: '' };
    // mount-only seed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [national, setNational] = useState<string>(initial.national);

  // Mirror controlled `value` into internal state without an effect.
  const [storedValue, setStoredValue] = useState(value);
  if (value !== storedValue) {
    setStoredValue(value);
    if (value === undefined || value === '') {
      if (national !== '') setNational('');
    } else {
      const parsed = parseE164(value);
      if (parsed !== null) {
        if (parsed.country !== country) setCountry(parsed.country);
        if (parsed.national !== national) setNational(parsed.national);
      }
    }
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const emit = useCallback(
    (nextNational: string, nextCountry: CountryCode) => {
      onValueChange?.(toE164(nextNational, nextCountry));
    },
    [onValueChange],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.startsWith('+')) {
      const detected = detectCountryFromInternational(raw);
      if (detected !== null) {
        const formatted = formatNational(detected.national, detected.country);
        setCountry(detected.country);
        setNational(formatted);
        emit(formatted, detected.country);
        return;
      }
    }
    const formatted = formatNational(raw, country);
    setNational(formatted);
    emit(formatted, country);
  };

  const handleCountryChange = (next: CountryCode) => {
    const digits = national.replace(/\D/g, '');
    const formatted = formatNational(digits, next);
    setCountry(next);
    setNational(formatted);
    emit(formatted, next);
    inputRef.current?.focus();
  };

  const valid = useMemo(() => isValidNational(national, country), [national, country]);
  const e164Memo = useMemo(() => toE164(national, country), [national, country]);

  useImperativeHandle(
    ref,
    () => ({
      isValid: valid,
      countryCode: country,
      e164: e164Memo,
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }),
    [valid, country, e164Memo],
  );

  return (
    <div
      className={cn(
        shellStyles({ variant: effectiveVariant, inputSize }),
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <CountryPicker
        country={country}
        onCountryChange={handleCountryChange}
        preferredCountries={preferredCountries}
        disabled={disabled}
        ariaLabel={countryAriaLabel}
        locale={locale}
      />
      <input
        ref={inputRef}
        id={inputId}
        type="tel"
        autoComplete="tel-national"
        inputMode="tel"
        spellCheck={false}
        placeholder={placeholder}
        value={national}
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        aria-labelledby={aria['aria-labelledby']}
        className={cn(
          'block min-w-0 flex-1 bg-transparent px-3 placeholder:text-foreground-subtle focus:outline-none disabled:cursor-not-allowed',
          inputSize === 'lg' ? 'text-base' : 'text-sm',
        )}
        {...rest}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Country picker                                                            */
/* -------------------------------------------------------------------------- */

interface CountryPickerProps {
  country: CountryCode;
  onCountryChange: (next: CountryCode) => void;
  preferredCountries: ReadonlyArray<CountryCode> | undefined;
  disabled: boolean;
  ariaLabel: string;
  locale: string;
}

function CountryPicker({
  country,
  onCountryChange,
  preferredCountries,
  disabled,
  ariaLabel,
  locale,
}: CountryPickerProps) {
  const { isOpen, open, close, toggle } = useDisclosure(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  const allEntries = useMemo(() => getCountryEntries(locale), [locale]);

  const ordered = useMemo<ReadonlyArray<CountryEntry>>(() => {
    if (preferredCountries === undefined || preferredCountries.length === 0) return allEntries;
    const preferredSet = new Set(preferredCountries);
    const top: CountryEntry[] = [];
    preferredCountries.forEach((code) => {
      const entry = allEntries.find((c) => c.code === code);
      if (entry !== undefined) top.push(entry);
    });
    const rest = allEntries.filter((c) => !preferredSet.has(c.code));
    return [...top, ...rest];
  }, [allEntries, preferredCountries]);

  const filtered = useMemo<ReadonlyArray<CountryEntry>>(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return ordered;
    const stripped = q.replace(/^\+/, '');
    return ordered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.callingCode.includes(stripped) ||
        c.code.toLowerCase().includes(q),
    );
  }, [ordered, query]);

  const closePanel = useCallback(() => {
    setQuery('');
    close();
  }, [close]);

  const handleSelect = useCallback(
    (entry: CountryEntry) => {
      onCountryChange(entry.code);
      closePanel();
    },
    [onCountryChange, closePanel],
  );

  const listbox = useListbox<CountryEntry>({
    items: filtered,
    getItemValue: (c) => c.code,
    selectedValue: country,
    onSelect: handleSelect,
  });

  useEscapeKey(
    () => {
      closePanel();
      triggerRef.current?.focus();
    },
    { enabled: isOpen },
  );

  useClickOutside(
    triggerRef,
    (event) => {
      const target = event.target;
      if (panelRef.current !== null && target instanceof Node && panelRef.current.contains(target)) {
        return;
      }
      closePanel();
    },
    { enabled: isOpen },
  );

  const pos = usePosition(triggerRef, panelRef, {
    placement: 'bottom-start',
    offset: 4,
    enabled: isOpen,
  });

  // Focus the search input on open. Query reset happens in closePanel(); we
  // don't drive setState from the effect body — that would cascade renders.
  useEffect(() => {
    if (!isOpen) return undefined;
    const id = window.requestAnimationFrame(() => {
      // preventScroll: portal renders at (0,0) until usePosition's measurement
      // resolves on the next frame — a plain .focus() would scroll the page.
      searchRef.current?.focus({ preventScroll: true });
      listbox.setActiveIndex(0);
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen, listbox]);

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[listbox.activeIndex];
      if (item !== undefined) handleSelect(item);
      return;
    }
    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === 'Home' ||
      e.key === 'End' ||
      e.key === 'PageUp' ||
      e.key === 'PageDown'
    ) {
      listbox.onKeyDown(e);
    }
  };

  const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  const lb = listbox.getListboxProps();
  const flag = getFlagEmoji(country);
  const callingCode = useMemo(() => {
    const entry = allEntries.find((c) => c.code === country);
    return entry?.callingCode ?? '';
  }, [allEntries, country]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={lb.id}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'flex items-center gap-1.5 border-r border-border px-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus:bg-surface-muted disabled:cursor-not-allowed',
        )}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {flag}
        </span>
        <span className="font-medium">+{callingCode}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-foreground-subtle transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen ? (
        <Portal>
          <div
            ref={panelRef}
            data-side={pos.placement}
            style={{ position: 'absolute', left: pos.x, top: pos.y }}
            className="z-[60] w-72 overflow-hidden rounded-md border border-border bg-surface shadow-lg motion-safe:animate-dialog-in"
          >
            <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
              <Search className="h-4 w-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                role="searchbox"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search country"
                aria-controls={lb.id}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  listbox.setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search…"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
              />
            </div>
            <ul
              {...lb}
              tabIndex={-1}
              className="max-h-64 overflow-y-auto p-1 outline-none"
            >
              {filtered.length === 0 ? (
                <li
                  role="presentation"
                  className="px-3 py-6 text-center text-sm text-foreground-subtle"
                >
                  No matches
                </li>
              ) : (
                filtered.map((entry, index) => {
                  const itemProps = listbox.getItemProps(index);
                  return (
                    <CountryOption
                      key={entry.code}
                      entry={entry}
                      itemProps={itemProps}
                      onMouseMove={() => {
                        if (listbox.activeIndex !== index) listbox.setActiveIndex(index);
                      }}
                      onClick={() => handleSelect(entry)}
                    />
                  );
                })
              )}
            </ul>
          </div>
        </Portal>
      ) : null}
    </>
  );
}

const COUNTRY_OPTION_BASE_CLASS =
  'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground data-[active=true]:bg-surface-muted';

interface CountryOptionProps {
  entry: CountryEntry;
  itemProps: ReturnType<ReturnType<typeof useListbox<CountryEntry>>['getItemProps']>;
  onMouseMove: () => void;
  onClick: () => void;
}

function CountryOption({ entry, itemProps, onMouseMove, onClick }: CountryOptionProps) {
  return (
    // role="option" is provided via {...itemProps}; the lint rule cannot see
    // attributes through spread.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <li
      {...itemProps}
      onMouseMove={onMouseMove}
      onClick={onClick}
      className={COUNTRY_OPTION_BASE_CLASS}
    >
      <span aria-hidden="true" className="shrink-0 text-base leading-none">
        {getFlagEmoji(entry.code)}
      </span>
      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
      <span className="shrink-0 tabular-nums text-foreground-muted">+{entry.callingCode}</span>
    </li>
  );
}
