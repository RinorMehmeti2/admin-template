import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent as ReactFocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useId } from '@/hooks/useId';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';
import { IconButton } from '@/components/primitives/IconButton';
import {
  clampToRange,
  formatForDisplay,
  formatForEdit,
  parseNumber,
  type ParseOptions,
} from './numberInputUtils';

const shellStyles = cva(
  'relative flex items-stretch overflow-hidden rounded-md border bg-surface text-foreground transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background',
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

const DEFAULT_LOCALE: string =
  typeof Intl !== 'undefined' ? Intl.NumberFormat().resolvedOptions().locale : 'en';

export interface NumberInputProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'defaultValue' | 'onChange' | 'prefix' | 'size' | 'min' | 'max' | 'step' | 'type'
    >,
    VariantProps<typeof shellStyles> {
  ref?: Ref<HTMLInputElement>;

  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;

  min?: number;
  max?: number;
  step?: number;

  precision?: number;
  allowNegative?: boolean;

  formatOptions?: Intl.NumberFormatOptions;
  parseOptions?: ParseOptions;

  locale?: string;

  prefix?: ReactNode;
  suffix?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  /** Enable wheel scroll to change value when focused. Default: false. */
  allowWheel?: boolean;

  incrementLabel?: string;
  decrementLabel?: string;

  hideStepper?: boolean;
}

interface RepeatHandle {
  timeoutId: number | undefined;
  running: boolean;
}

export function NumberInput({
  ref,
  className,
  variant,
  inputSize,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  precision,
  allowNegative = true,
  formatOptions,
  parseOptions,
  locale = DEFAULT_LOCALE,
  prefix,
  suffix,
  leftIcon,
  rightIcon,
  allowWheel = false,
  incrementLabel = 'Increment',
  decrementLabel = 'Decrement',
  hideStepper = false,
  disabled = false,
  readOnly = false,
  placeholder,
  id,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}: NumberInputProps) {
  const [committed, setCommitted] = useControllableState<number | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });

  const aria = useFieldAriaProps(
    {
      id,
      'aria-describedby': rest['aria-describedby'],
      'aria-invalid': rest['aria-invalid'],
      'aria-labelledby': rest['aria-labelledby'],
    },
    variant === 'error',
  );
  const effectiveVariant = variant ?? (aria.hasError ? 'error' : 'default');
  const generatedId = useId('number-input');
  const inputId = aria.id ?? generatedId;

  const parseOpts = useMemo<ParseOptions>(
    () => ({ allowNegative: parseOptions?.allowNegative ?? allowNegative }),
    [parseOptions?.allowNegative, allowNegative],
  );

  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState<string>(() =>
    formatForDisplay(committed ?? null, locale, formatOptions, precision),
  );

  // Sync draft when external value or formatting changes while not editing.
  // setState in an effect is the correct shape here: draft is internally
  // editable while focused, but must mirror the formatted value otherwise —
  // the source of truth is `committed`, and reformatting happens on locale /
  // formatOptions / precision changes that are outside the typing flow.
  useEffect(() => {
    if (isFocused) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(formatForDisplay(committed ?? null, locale, formatOptions, precision));
  }, [committed, isFocused, locale, formatOptions, precision]);

  const repeatRef = useRef<RepeatHandle>({ timeoutId: undefined, running: false });
  const clearRepeat = useCallback(() => {
    if (repeatRef.current.timeoutId !== undefined) {
      window.clearTimeout(repeatRef.current.timeoutId);
    }
    repeatRef.current = { timeoutId: undefined, running: false };
  }, []);
  useEffect(() => clearRepeat, [clearRepeat]);

  const stepBy = useCallback(
    (direction: 1 | -1, multiplier = 1) => {
      const delta = step * multiplier * direction;
      const base = committed ?? min ?? 0;
      const next = clampToRange(base + delta, min, max);
      if (next === committed) return;
      setCommitted(next);
      const text = isFocused
        ? formatForEdit(next, locale, precision)
        : formatForDisplay(next, locale, formatOptions, precision);
      setDraft(text);
    },
    [committed, step, min, max, isFocused, locale, precision, formatOptions, setCommitted],
  );

  const startRepeat = useCallback(
    (direction: 1 | -1) => {
      if (disabled || readOnly) return;
      stepBy(direction);
      repeatRef.current.running = true;
      let delay = 80;
      const tick = () => {
        if (!repeatRef.current.running) return;
        stepBy(direction);
        delay = Math.max(30, Math.floor(delay * 0.85));
        repeatRef.current.timeoutId = window.setTimeout(tick, delay);
      };
      repeatRef.current.timeoutId = window.setTimeout(tick, 400);
    },
    [disabled, readOnly, stepBy],
  );

  const stopRepeat = () => {
    clearRepeat();
  };

  const handleFocus = (e: ReactFocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setDraft(formatForEdit(committed ?? null, locale, precision));
    onFocus?.(e);
  };

  const handleBlur = (e: ReactFocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const trimmed = draft.trim();
    if (trimmed === '') {
      setCommitted(null);
      setDraft('');
    } else {
      const parsed = parseNumber(trimmed, locale, parseOpts);
      if (parsed === null) {
        setDraft(formatForDisplay(committed ?? null, locale, formatOptions, precision));
      } else {
        const clamped = clampToRange(parsed, min, max);
        setCommitted(clamped);
        setDraft(formatForDisplay(clamped, locale, formatOptions, precision));
      }
    }
    onBlur?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value;
    setDraft(text);
    if (text.trim() === '') {
      setCommitted(null);
      return;
    }
    const parsed = parseNumber(text, locale, parseOpts);
    if (parsed !== null) {
      setCommitted(parsed);
    }
  };

  const jumpTo = useCallback(
    (next: number) => {
      setCommitted(next);
      const text = isFocused
        ? formatForEdit(next, locale, precision)
        : formatForDisplay(next, locale, formatOptions, precision);
      setDraft(text);
    },
    [setCommitted, isFocused, locale, precision, formatOptions],
  );

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly) {
      onKeyDown?.(e);
      return;
    }
    let handled = true;
    switch (e.key) {
      case 'ArrowUp':
        stepBy(1, e.shiftKey ? 10 : 1);
        break;
      case 'ArrowDown':
        stepBy(-1, e.shiftKey ? 10 : 1);
        break;
      case 'PageUp':
        stepBy(1, 10);
        break;
      case 'PageDown':
        stepBy(-1, 10);
        break;
      case 'Home':
        if (min !== undefined) jumpTo(min);
        else handled = false;
        break;
      case 'End':
        if (max !== undefined) jumpTo(max);
        else handled = false;
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
    onKeyDown?.(e);
  };

  const handleWheel = (e: ReactWheelEvent<HTMLInputElement>) => {
    if (!allowWheel || !isFocused || disabled || readOnly) return;
    e.preventDefault();
    stepBy(e.deltaY < 0 ? 1 : -1);
  };

  const atMin =
    min !== undefined && committed !== null && committed !== undefined && committed <= min;
  const atMax =
    max !== undefined && committed !== null && committed !== undefined && committed >= max;
  const showStepper = !hideStepper && rightIcon === undefined;
  const valueText =
    committed !== null && committed !== undefined
      ? formatForDisplay(committed, locale, formatOptions, precision)
      : undefined;

  const stepperButtonClass =
    'h-1/2 w-7 flex-1 rounded-none border-0 bg-transparent px-0 text-foreground-muted hover:bg-surface-muted focus-visible:ring-0 focus-visible:ring-offset-0';

  const onStepperPointerDown = (direction: 1 | -1, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    // Prevent the button from stealing focus from the input.
    e.preventDefault();
    startRepeat(direction);
  };

  return (
    <div
      className={cn(
        shellStyles({ variant: effectiveVariant, inputSize }),
        disabled && 'cursor-not-allowed opacity-50',
        readOnly && 'bg-surface-muted',
        className,
      )}
    >
      {leftIcon !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none flex items-center pl-3 text-foreground-subtle"
        >
          {leftIcon}
        </span>
      ) : null}
      {prefix !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none flex items-center border-r border-border px-3 text-sm text-foreground-muted"
        >
          {prefix}
        </span>
      ) : null}

      <input
        ref={ref}
        id={inputId}
        type="text"
        inputMode={precision !== undefined && precision > 0 ? 'decimal' : 'numeric'}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={committed ?? undefined}
        aria-valuetext={valueText}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        aria-labelledby={aria['aria-labelledby']}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        value={draft}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        className={cn(
          'block min-w-0 flex-1 bg-transparent px-3 placeholder:text-foreground-subtle focus:outline-none disabled:cursor-not-allowed',
          inputSize === 'lg' ? 'text-base' : 'text-sm',
        )}
        {...rest}
      />

      {suffix !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none flex items-center border-l border-border px-3 text-sm text-foreground-muted"
        >
          {suffix}
        </span>
      ) : null}

      {rightIcon !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none flex items-center pr-3 text-foreground-subtle"
        >
          {rightIcon}
        </span>
      ) : showStepper ? (
        <div className="flex w-7 flex-col border-l border-border">
          <IconButton
            variant="ghost"
            size="sm"
            tabIndex={-1}
            aria-label={incrementLabel}
            aria-controls={inputId}
            disabled={disabled || readOnly || atMax}
            onPointerDown={(e) => onStepperPointerDown(1, e)}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            onPointerCancel={stopRepeat}
            className={stepperButtonClass}
          >
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
          </IconButton>
          <span aria-hidden="true" className="h-px bg-border" />
          <IconButton
            variant="ghost"
            size="sm"
            tabIndex={-1}
            aria-label={decrementLabel}
            aria-controls={inputId}
            disabled={disabled || readOnly || atMin}
            onPointerDown={(e) => onStepperPointerDown(-1, e)}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            onPointerCancel={stopRepeat}
            className={stepperButtonClass}
          >
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          </IconButton>
        </div>
      ) : null}
    </div>
  );
}
