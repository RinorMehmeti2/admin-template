import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/cn';
import { Input } from '@/components/forms/Input';
import { Portal } from '@/components/overlays/Portal';
import { Calendar } from '@/components/forms/Calendar';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useControllableState } from '@/hooks/useControllableState';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useId } from '@/hooks/useId';
import { usePosition } from '@/hooks/usePosition';
import {
  formatDate,
  isDayDisabled,
  isSameMonth,
  isValid,
  parseDate,
  startOfMonth,
  type WeekStartsOn,
} from '@/lib/date';

export interface DatePickerProps {
  ref?: Ref<HTMLInputElement>;
  value?: Date | null | undefined;
  defaultValue?: Date | null | undefined;
  onChange?: ((next: Date | null) => void) | undefined;
  /** date-fns format string. Default 'PP' → "May 9, 2026". */
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  /** When true, the input is editable and parses on blur/Enter. Default false. */
  allowTextInput?: boolean;
  weekStartsOn?: WeekStartsOn;
  locale?: Locale | undefined;
  className?: string;
  name?: string;
  id?: string;
  'aria-label'?: string;
}

export function DatePicker({
  ref,
  value: valueProp,
  defaultValue = null,
  onChange,
  format: formatStr = 'PP',
  placeholder,
  disabled = false,
  error = false,
  minDate,
  maxDate,
  isDateDisabled: isDateDisabledFn,
  allowTextInput = false,
  weekStartsOn = 1,
  locale,
  className,
  name,
  id: idProp,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const generatedId = useId('datepicker');
  const id = idProp ?? generatedId;

  const [selectedRaw, setSelected] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const selected: Date | null = selectedRaw ?? null;

  const { isOpen, open, close, setOpen } = useDisclosure(false);

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(selected ?? new Date()));

  const [text, setText] = useState<string>(() =>
    selected !== null ? formatDate(selected, formatStr, locale) : '',
  );

  // Sync the input's text when the controlled `selected` (or format/locale)
  // changes externally. Setting state during render — gated on a tracked
  // snapshot — is React's recommended pattern for prop-derived state, since
  // a useEffect-based sync would lint as a cascading effect.
  const [syncSelected, setSyncSelected] = useState(selected);
  const [syncFormat, setSyncFormat] = useState(formatStr);
  const [syncLocale, setSyncLocale] = useState(locale);
  if (selected !== syncSelected || formatStr !== syncFormat || locale !== syncLocale) {
    setSyncSelected(selected);
    setSyncFormat(formatStr);
    setSyncLocale(locale);
    setText(selected !== null ? formatDate(selected, formatStr, locale) : '');
  }

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedInputRef = useMergedRefs<HTMLInputElement>(inputRef, ref);

  const handleOpen = useCallback(() => {
    if (selected !== null && !isSameMonth(viewMonth, selected)) {
      setViewMonth(startOfMonth(selected));
    }
    open();
  }, [open, selected, viewMonth]);

  useEscapeKey(
    () => {
      if (isOpen) {
        close();
        inputRef.current?.focus();
      }
    },
    { enabled: isOpen },
  );

  useClickOutside(
    [triggerRef, contentRef],
    () => {
      if (isOpen) close();
    },
    { enabled: isOpen },
  );

  const pos = usePosition(triggerRef, contentRef, {
    placement: 'bottom-start',
    offset: 4,
    enabled: isOpen,
  });

  // On open, transfer focus into the calendar grid (active cell) so arrow
  // keys and PageUp/Down operate immediately. `preventScroll: true` is
  // critical: the portal renders at (0,0) until usePosition's measurement
  // rAF resolves, so a plain .focus() would scroll the page to the top of
  // the document.
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      const cell = contentRef.current?.querySelector<HTMLButtonElement>(
        '[role="gridcell"][tabindex="0"]:not([disabled])',
      );
      cell?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const commitText = useCallback(() => {
    if (!allowTextInput) return;
    const trimmed = text.trim();
    if (trimmed === '') {
      setSelected(null);
      return;
    }
    const parsed = parseDate(trimmed, formatStr, new Date(), locale);
    if (
      isValid(parsed) &&
      !isDayDisabled(parsed, {
        minDate,
        maxDate,
        isDateDisabled: isDateDisabledFn,
      })
    ) {
      setSelected(parsed);
      setViewMonth(startOfMonth(parsed));
    } else {
      // Reset to last valid value.
      setText(selected !== null ? formatDate(selected, formatStr, locale) : '');
    }
  }, [
    allowTextInput,
    text,
    setSelected,
    formatStr,
    locale,
    minDate,
    maxDate,
    isDateDisabledFn,
    selected,
  ]);

  const handleSelectDate = (date: Date) => {
    setSelected(date);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      handleOpen();
      return;
    }
    if (e.key === 'Enter' && allowTextInput) {
      e.preventDefault();
      commitText();
      if (isOpen) close();
    }
  };

  const handleInputClick = () => {
    if (!disabled && !allowTextInput && !isOpen) handleOpen();
  };

  const handleIconClick = () => {
    if (disabled) return;
    if (isOpen) {
      close();
    } else {
      handleOpen();
      inputRef.current?.focus();
    }
  };

  return (
    <div
      ref={triggerRef}
      data-component="datepicker"
      className={cn('relative inline-block w-full', className)}
    >
      <Input
        ref={mergedInputRef}
        id={id}
        name={name}
        type="text"
        readOnly={!allowTextInput}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        {...(error ? { 'aria-invalid': true as const, variant: 'error' as const } : {})}
        onChange={handleTextChange}
        onBlur={() => {
          if (allowTextInput) commitText();
        }}
        onKeyDown={handleKeyDown}
        onClick={handleInputClick}
        className={cn('pr-10', !allowTextInput && 'cursor-pointer')}
      />
      <button
        type="button"
        aria-label={isOpen ? 'Close calendar' : 'Open calendar'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={handleIconClick}
        tabIndex={-1}
        className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
      >
        <CalendarIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <Portal>
          <div
            ref={contentRef}
            role="dialog"
            aria-modal="false"
            aria-label="Choose date"
            data-side={pos.placement}
            style={{ position: 'absolute', left: pos.x, top: pos.y }}
            className="z-[60] rounded-md border border-border bg-surface shadow-lg motion-safe:animate-dialog-in"
          >
            <Calendar
              month={viewMonth}
              onMonthChange={setViewMonth}
              {...(selected !== null ? { value: selected } : {})}
              onChange={handleSelectDate}
              weekStartsOn={weekStartsOn}
              {...(minDate !== undefined ? { minDate } : {})}
              {...(maxDate !== undefined ? { maxDate } : {})}
              {...(isDateDisabledFn !== undefined ? { isDateDisabled: isDateDisabledFn } : {})}
              {...(locale !== undefined ? { locale } : {})}
            />
          </div>
        </Portal>
      ) : null}
    </div>
  );
}
