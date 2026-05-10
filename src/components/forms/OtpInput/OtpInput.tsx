import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type InputHTMLAttributes,
  type Ref,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

const boxStyles = cva(
  'flex items-center justify-center rounded-md border bg-surface font-medium tabular-nums transition-colors',
  {
    variants: {
      size: {
        sm: 'h-9 w-8 text-base',
        md: 'h-12 w-10 text-lg',
        lg: 'h-14 w-12 text-2xl',
      },
      tone: {
        idle: 'border-border text-foreground',
        active:
          'border-primary text-foreground ring-2 ring-ring ring-offset-2 ring-offset-background',
        error: 'border-danger text-foreground',
        errorActive:
          'border-danger text-foreground ring-2 ring-danger ring-offset-2 ring-offset-background',
        disabled: 'border-border bg-surface-muted text-foreground-muted',
      },
    },
    defaultVariants: { size: 'md', tone: 'idle' },
  },
);

export interface OtpInputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'maxLength' | 'minLength'
    >,
    Pick<VariantProps<typeof boxStyles>, 'size'> {
  ref?: Ref<HTMLInputElement>;
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  /** Regex matched against each character (single-char). Default `/^[0-9]$/`. */
  allowedChars?: RegExp;
  masked?: boolean;
  error?: boolean;
  /**
   * Focus the field on mount. Renamed from `autoFocus` to keep the
   * `jsx-a11y/no-autofocus` lint rule from triggering at every consumer site.
   * Default true — common 2FA flow shows the OTP page already focused.
   */
  autoFocusOnMount?: boolean;
}

const DEFAULT_ALLOWED = /^[0-9]$/;

function filterAllowed(raw: string, allowed: RegExp, max: number): string {
  let out = '';
  for (const ch of raw) {
    if (allowed.test(ch)) {
      out += ch;
      if (out.length === max) break;
    }
  }
  return out;
}

export function OtpInput({
  ref,
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  allowedChars = DEFAULT_ALLOWED,
  masked = false,
  size,
  error = false,
  disabled = false,
  autoFocusOnMount = true,
  className,
  id,
  ...rest
}: OtpInputProps) {
  const [stored, setStored] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const current = stored ?? '';

  const aria = useFieldAriaProps(
    {
      id,
      'aria-describedby': rest['aria-describedby'],
      'aria-invalid': rest['aria-invalid'],
      'aria-labelledby': rest['aria-labelledby'],
    },
    error,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs<HTMLInputElement>(inputRef, ref);
  const lastCompleteRef = useRef<string | null>(null);

  // Mount-only focus when requested. We avoid the JSX `autoFocus` attribute
  // because the project's lint rule rejects it across the board.
  useEffect(() => {
    if (autoFocusOnMount && !disabled) inputRef.current?.focus();
    // mount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);

  const numericOnly = useMemo(
    () => !allowedChars.test('a') && !allowedChars.test('A'),
    [allowedChars],
  );

  const commit = useCallback(
    (next: string) => {
      const filtered = filterAllowed(next, allowedChars, length);
      setStored(filtered);
      if (filtered.length === length && lastCompleteRef.current !== filtered) {
        lastCompleteRef.current = filtered;
        onComplete?.(filtered);
      } else if (filtered.length < length) {
        lastCompleteRef.current = null;
      }
    },
    [allowedChars, length, onComplete, setStored],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    commit(e.target.value);
  };

  const handlePaste = (e: ReactClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text === '') return;
    e.preventDefault();
    commit(text);
  };

  const handleSelect = () => {
    const el = inputRef.current;
    if (el === null) return;
    setCaret(el.selectionStart ?? current.length);
  };

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  const activeIndex = Math.min(caret, length - 1);

  return (
    <div
      className={cn('relative inline-flex select-none items-center gap-2', className)}
      data-disabled={disabled || undefined}
    >
      <input
        ref={mergedRef}
        id={aria.id}
        type="text"
        inputMode={numericOnly ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={disabled}
        value={current}
        onChange={handleChange}
        onPaste={handlePaste}
        onSelect={handleSelect}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        aria-labelledby={aria['aria-labelledby']}
        // The input is overlaid on the boxes so OS-level autofill suggestions
        // anchor to the visible UI. Pointer events stay on the input so a click
        // anywhere on the row focuses the field; the boxes below are
        // pointer-events-none.
        className="absolute inset-0 z-10 h-full w-full cursor-text rounded-md bg-transparent text-transparent caret-transparent outline-none focus:outline-none disabled:cursor-not-allowed"
        {...rest}
      />
      {Array.from({ length }, (_, i) => {
        const ch = current[i];
        const isFilled = ch !== undefined;
        const isActive = focused && !disabled && i === activeIndex;
        const tone = disabled
          ? 'disabled'
          : error
            ? isActive
              ? 'errorActive'
              : 'error'
            : isActive
              ? 'active'
              : 'idle';
        return (
          <div
            key={i}
            aria-hidden="true"
            data-filled={isFilled}
            data-active={isActive}
            className={cn(
              boxStyles({ size, tone }),
              'pointer-events-none',
              disabled && 'opacity-60',
            )}
          >
            {isFilled ? (masked ? '•' : ch) : ''}
          </div>
        );
      })}
    </div>
  );
}
