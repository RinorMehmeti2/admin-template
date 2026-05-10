import { useCallback, useEffect, useMemo, useRef, useState, type Ref } from 'react';
import { Clock as ClockIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/forms/Input';
import { Portal } from '@/components/overlays/Portal';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useId } from '@/hooks/useId';
import { usePosition } from '@/hooks/usePosition';
import { RovingFocusGroup, useRovingFocusItem } from '@/hooks/useRovingFocus';

export type TimeFormat = '12h' | '24h';
export type TimeValueInput = Date | string | null;

export interface TimePickerProps {
  ref?: Ref<HTMLInputElement>;
  value?: TimeValueInput | undefined;
  defaultValue?: TimeValueInput | undefined;
  /**
   * Called when the user picks a value. Emits a `Date` when the consumer's
   * `value` / `defaultValue` was a `Date`, otherwise emits a zero-padded
   * string ('HH:MM' or 'HH:MM:SS' depending on `withSeconds`).
   */
  onChange?: ((next: Date | string | null) => void) | undefined;
  format?: TimeFormat;
  /** Minute (and second) step. Values are floor-snapped to the step. */
  step?: number;
  withSeconds?: boolean;
  minTime?: TimeValueInput | undefined;
  maxTime?: TimeValueInput | undefined;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  'aria-label'?: string;
}

interface TimeParts {
  h: number; // 0..23
  m: number; // 0..59
  s: number; // 0..59
}

function snapToStep(value: number, step: number): number {
  if (step <= 1) return value;
  return Math.floor(value / step) * step;
}

function parseTime(input: TimeValueInput | undefined, step: number): TimeParts | null {
  if (input === null || input === undefined) return null;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return {
      h: input.getHours(),
      m: snapToStep(input.getMinutes(), step),
      s: snapToStep(input.getSeconds(), step),
    };
  }
  if (typeof input === 'string') {
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(input.trim());
    if (m === null) return null;
    const h = Number(m[1]);
    const mn = Number(m[2]);
    const sc = m[3] !== undefined ? Number(m[3]) : 0;
    if (h > 23 || mn > 59 || sc > 59) return null;
    return { h, m: snapToStep(mn, step), s: snapToStep(sc, step) };
  }
  return null;
}

function formatString(t: TimeParts, withSeconds: boolean): string {
  const hh = String(t.h).padStart(2, '0');
  const mm = String(t.m).padStart(2, '0');
  if (!withSeconds) return `${hh}:${mm}`;
  const ss = String(t.s).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatDisplay(t: TimeParts, format: TimeFormat, withSeconds: boolean): string {
  if (format === '24h') return formatString(t, withSeconds);
  const period = t.h < 12 ? 'AM' : 'PM';
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  const mm = String(t.m).padStart(2, '0');
  const base = `${h12}:${mm}`;
  if (!withSeconds) return `${base} ${period}`;
  const ss = String(t.s).padStart(2, '0');
  return `${base}:${ss} ${period}`;
}

function totalSeconds(t: TimeParts): number {
  return t.h * 3600 + t.m * 60 + t.s;
}

function isOutOfBounds(t: TimeParts, min: TimeParts | null, max: TimeParts | null): boolean {
  const tot = totalSeconds(t);
  if (min !== null && tot < totalSeconds(min)) return true;
  if (max !== null && tot > totalSeconds(max)) return true;
  return false;
}

function convert12to24(display: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return display === 12 ? 0 : display;
  return display === 12 ? 12 : display + 12;
}

export function TimePicker({
  ref,
  value: valueProp,
  defaultValue,
  onChange,
  format = '24h',
  step = 1,
  withSeconds = false,
  minTime,
  maxTime,
  disabled = false,
  error = false,
  className,
  name,
  id: idProp,
  placeholder,
  'aria-label': ariaLabel,
}: TimePickerProps) {
  const generatedId = useId('timepicker');
  const id = idProp ?? generatedId;

  // Decide emit type from the first non-null input we observe. Once chosen,
  // it stays sticky for the lifetime of the component to avoid type-flipping
  // surprises if a consumer alternates kinds.
  const emitTypeRef = useRef<'date' | 'string'>(
    valueProp instanceof Date || defaultValue instanceof Date ? 'date' : 'string',
  );

  const min = useMemo(() => parseTime(minTime, 1), [minTime]);
  const max = useMemo(() => parseTime(maxTime, 1), [maxTime]);

  const [parts, setParts] = useState<TimeParts | null>(() =>
    parseTime(valueProp ?? defaultValue, step),
  );

  // Sync from controlled value (and from format/step changes that affect the
  // parsed shape). Render-time conditional setState keeps us out of the
  // cascading-effect lint trap.
  const [seenValue, setSeenValue] = useState(valueProp);
  const [seenStep, setSeenStep] = useState(step);
  if (valueProp !== seenValue || step !== seenStep) {
    setSeenValue(valueProp);
    setSeenStep(step);
    if (valueProp !== undefined) {
      setParts(parseTime(valueProp, step));
    } else if (step !== seenStep && parts !== null) {
      setParts({ h: parts.h, m: snapToStep(parts.m, step), s: snapToStep(parts.s, step) });
    }
  }

  const { isOpen, open, close } = useDisclosure(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedInputRef = useMergedRefs<HTMLInputElement>(inputRef, ref);

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

  const handleOpen = useCallback(() => {
    if (parts === null) {
      const now = new Date();
      const seeded: TimeParts = {
        h: now.getHours(),
        m: snapToStep(now.getMinutes(), step),
        s: snapToStep(now.getSeconds(), step),
      };
      setParts(seeded);
    }
    open();
  }, [parts, step, open]);

  // On open, focus the first column's active item so arrow keys and Tab work
  // immediately. `preventScroll: true` avoids a viewport jump while the
  // portal positions itself (initial coords are 0,0 until usePosition's rAF
  // resolves).
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      const btn = contentRef.current?.querySelector<HTMLButtonElement>(
        '[data-time-column] [tabindex="0"]:not([disabled])',
      );
      btn?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const commit = (next: TimeParts) => {
    setParts(next);
    if (emitTypeRef.current === 'date') {
      const d = new Date();
      d.setHours(next.h, next.m, next.s, 0);
      onChange?.(d);
    } else {
      onChange?.(formatString(next, withSeconds));
    }
  };

  const minutes = useMemo(() => {
    const arr: number[] = [];
    for (let m = 0; m < 60; m += step) arr.push(m);
    return arr;
  }, [step]);

  const seconds = useMemo(() => {
    const arr: number[] = [];
    for (let s = 0; s < 60; s += step) arr.push(s);
    return arr;
  }, [step]);

  const hours24 = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  // 12h display order — start with 12, then 1..11. Matches dial convention.
  const hours12 = useMemo(() => [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], []);

  const display = parts !== null ? formatDisplay(parts, format, withSeconds) : '';

  const visibleParts: TimeParts = parts ?? { h: 0, m: 0, s: 0 };
  const period: 'AM' | 'PM' = visibleParts.h < 12 ? 'AM' : 'PM';
  const display12Hour = visibleParts.h % 12 === 0 ? 12 : visibleParts.h % 12;

  const setHour24 = (h: number) => commit({ ...visibleParts, h });
  const setMinute = (m: number) => commit({ ...visibleParts, m });
  const setSecond = (s: number) => commit({ ...visibleParts, s });
  const setPeriod = (p: 'AM' | 'PM') => {
    let h = visibleParts.h;
    if (p === 'AM' && h >= 12) h -= 12;
    else if (p === 'PM' && h < 12) h += 12;
    commit({ ...visibleParts, h });
  };

  const closeAndReturn = () => {
    close();
    inputRef.current?.focus();
  };

  return (
    <div
      ref={triggerRef}
      data-component="timepicker"
      className={cn('relative inline-block w-full', className)}
    >
      <Input
        ref={mergedInputRef}
        id={id}
        name={name}
        type="text"
        readOnly
        disabled={disabled}
        placeholder={placeholder}
        value={display}
        aria-label={ariaLabel}
        {...(error ? { 'aria-invalid': true as const, variant: 'error' as const } : {})}
        onClick={() => {
          if (!disabled && !isOpen) handleOpen();
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            handleOpen();
          }
        }}
        className="cursor-pointer pr-10"
      />
      <button
        type="button"
        aria-label={isOpen ? 'Close time picker' : 'Open time picker'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
        tabIndex={-1}
        onClick={() => {
          if (disabled) return;
          if (isOpen) {
            close();
          } else {
            handleOpen();
            inputRef.current?.focus();
          }
        }}
        className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
      >
        <ClockIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <Portal>
          <div
            ref={contentRef}
            role="dialog"
            aria-label="Choose time"
            data-side={pos.placement}
            style={{ position: 'absolute', left: pos.x, top: pos.y }}
            className="z-[60] flex gap-1 rounded-md border border-border bg-surface p-2 shadow-lg motion-safe:animate-dialog-in"
          >
            <TimeColumn<number>
              ariaLabel="Hours"
              items={format === '12h' ? hours12 : hours24}
              selected={format === '12h' ? display12Hour : visibleParts.h}
              format={(n) => (format === '12h' ? String(n) : String(n).padStart(2, '0'))}
              isItemDisabled={(n) => {
                const cand: TimeParts =
                  format === '12h'
                    ? { ...visibleParts, h: convert12to24(n, period) }
                    : { ...visibleParts, h: n };
                return isOutOfBounds(cand, min, max);
              }}
              onSelect={(n) => {
                if (format === '12h') setHour24(convert12to24(n, period));
                else setHour24(n);
              }}
              onCommit={closeAndReturn}
              isOpen={isOpen}
            />
            <TimeColumn<number>
              ariaLabel="Minutes"
              items={minutes}
              selected={visibleParts.m}
              format={(n) => String(n).padStart(2, '0')}
              isItemDisabled={(n) => isOutOfBounds({ ...visibleParts, m: n }, min, max)}
              onSelect={setMinute}
              onCommit={closeAndReturn}
              isOpen={isOpen}
            />
            {withSeconds ? (
              <TimeColumn<number>
                ariaLabel="Seconds"
                items={seconds}
                selected={visibleParts.s}
                format={(n) => String(n).padStart(2, '0')}
                isItemDisabled={(n) => isOutOfBounds({ ...visibleParts, s: n }, min, max)}
                onSelect={setSecond}
                onCommit={closeAndReturn}
                isOpen={isOpen}
              />
            ) : null}
            {format === '12h' ? (
              <TimeColumn<'AM' | 'PM'>
                ariaLabel="Period"
                items={['AM', 'PM']}
                selected={period}
                format={(p) => p}
                isItemDisabled={(p) => {
                  const targetH = convert12to24(display12Hour, p);
                  return isOutOfBounds({ ...visibleParts, h: targetH }, min, max);
                }}
                onSelect={(p) => setPeriod(p)}
                onCommit={closeAndReturn}
                isOpen={isOpen}
              />
            ) : null}
          </div>
        </Portal>
      ) : null}
    </div>
  );
}

interface TimeColumnProps<T extends number | string> {
  ariaLabel: string;
  items: ReadonlyArray<T>;
  selected: T;
  format: (item: T) => string;
  isItemDisabled?: (item: T) => boolean;
  onSelect: (item: T) => void;
  onCommit: () => void;
  isOpen: boolean;
}

function TimeColumn<T extends number | string>({
  ariaLabel,
  items,
  selected,
  format,
  isItemDisabled,
  onSelect,
  onCommit,
  isOpen,
}: TimeColumnProps<T>) {
  const idx = Math.max(0, items.indexOf(selected));
  return (
    <RovingFocusGroup orientation="vertical" loop={false} defaultIndex={idx}>
      <div
        role="listbox"
        aria-label={ariaLabel}
        data-time-column={ariaLabel.toLowerCase()}
        className="flex h-48 w-14 flex-col gap-0.5 overflow-y-auto scroll-smooth p-1"
      >
        {items.map((item, i) => (
          <TimeColumnItem
            key={String(item)}
            index={i}
            selected={selected === item}
            disabled={isItemDisabled !== undefined && isItemDisabled(item)}
            label={format(item)}
            onSelect={() => onSelect(item)}
            onCommit={onCommit}
            isOpen={isOpen}
          />
        ))}
      </div>
    </RovingFocusGroup>
  );
}

interface TimeColumnItemProps {
  index: number;
  selected: boolean;
  disabled: boolean;
  label: string;
  onSelect: () => void;
  onCommit: () => void;
  isOpen: boolean;
}

function TimeColumnItem({
  index,
  selected,
  disabled,
  label,
  onSelect,
  onCommit,
  isOpen,
}: TimeColumnItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusItem(index, ref);

  // Auto-scroll the selected item into view when the popover opens. We set
  // the column's `scrollTop` directly rather than calling `scrollIntoView`,
  // because scrollIntoView walks every scrollable ancestor up to the
  // viewport — and before usePosition has resolved, the column lives at
  // document (0,0), so the browser would scroll the *page* to bring it into
  // view (causing a jarring jump). Manual scrollTop is local to the column.
  useEffect(() => {
    if (!selected || !isOpen) return;
    const el = ref.current;
    if (el === null) return;
    const column = el.parentElement;
    if (column === null) return;
    const target = el.offsetTop - column.clientHeight / 2 + el.clientHeight / 2;
    column.scrollTop = Math.max(0, target);
  }, [selected, isOpen]);

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      tabIndex={tabIndex}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) onSelect();
          if (e.key === 'Enter') onCommit();
          return;
        }
        onKeyDown(e);
      }}
      onFocus={onFocus}
      onClick={() => {
        if (!disabled) onSelect();
      }}
      className={cn(
        'w-full rounded-sm py-1 text-center text-sm font-medium tabular-nums transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        !selected && !disabled && 'text-foreground hover:bg-surface-muted',
        selected && 'bg-primary text-primary-foreground hover:bg-primary/90',
        disabled && 'pointer-events-none text-foreground-subtle/50',
      )}
    >
      {label}
    </button>
  );
}
