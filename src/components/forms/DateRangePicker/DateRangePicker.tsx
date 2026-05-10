import { useCallback, useEffect, useMemo, useRef, useState, type Ref } from 'react';
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
  addDays,
  addMonths,
  endOfMonth,
  formatDate,
  startOfMonth,
  subMonths,
  type WeekStartsOn,
} from '@/lib/date';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DateRangePreset {
  label: string;
  /** Called on click. Should return a fresh, current range. */
  getRange: () => { from: Date; to: Date };
}

export interface DateRangePickerProps {
  ref?: Ref<HTMLDivElement>;
  value?: DateRange | undefined;
  defaultValue?: DateRange | undefined;
  onChange?: ((next: DateRange) => void) | undefined;
  format?: string;
  placeholderFrom?: string;
  placeholderTo?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  weekStartsOn?: WeekStartsOn;
  locale?: Locale | undefined;
  /** Override the preset list shown in the popover sidebar. */
  presets?: ReadonlyArray<DateRangePreset>;
  /** Hide the preset sidebar entirely. */
  hidePresets?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const EMPTY_RANGE: DateRange = { from: null, to: null };

/**
 * Default presets — Today, Yesterday, Last 7/30 days, This/Last month.
 * Recomputed on each click so they always reflect "now".
 */
function buildDefaultPresets(): DateRangePreset[] {
  return [
    {
      label: 'Today',
      getRange: () => {
        const t = new Date();
        return { from: t, to: t };
      },
    },
    {
      label: 'Yesterday',
      getRange: () => {
        const y = addDays(new Date(), -1);
        return { from: y, to: y };
      },
    },
    {
      label: 'Last 7 days',
      getRange: () => ({ from: addDays(new Date(), -6), to: new Date() }),
    },
    {
      label: 'Last 30 days',
      getRange: () => ({ from: addDays(new Date(), -29), to: new Date() }),
    },
    {
      label: 'This month',
      getRange: () => {
        const t = new Date();
        return { from: startOfMonth(t), to: endOfMonth(t) };
      },
    },
    {
      label: 'Last month',
      getRange: () => {
        const ref = subMonths(new Date(), 1);
        return { from: startOfMonth(ref), to: endOfMonth(ref) };
      },
    },
  ];
}

export function DateRangePicker({
  ref,
  value: valueProp,
  defaultValue,
  onChange,
  format: formatStr = 'PP',
  placeholderFrom = 'Start date',
  placeholderTo = 'End date',
  disabled = false,
  error = false,
  minDate,
  maxDate,
  isDateDisabled,
  weekStartsOn = 1,
  locale,
  presets,
  hidePresets = false,
  className,
  id: idProp,
  'aria-label': ariaLabel,
}: DateRangePickerProps) {
  const generatedId = useId('rangepicker');
  const id = idProp ?? generatedId;
  const fromInputId = `${id}-from`;
  const toInputId = `${id}-to`;

  const [rangeRaw, setRange] = useControllableState<DateRange>({
    value: valueProp,
    defaultValue: defaultValue ?? EMPTY_RANGE,
    onChange,
  });
  const range: DateRange = rangeRaw ?? EMPTY_RANGE;

  const { isOpen, open, close, setOpen } = useDisclosure(false);

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(range.from ?? new Date()));

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const mergedTriggerRef = useMergedRefs<HTMLDivElement>(triggerRef, ref);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (range.from !== null && !sameMonthYear(viewMonth, range.from)) {
      setViewMonth(startOfMonth(range.from));
    }
    setHoverDate(null);
    open();
  }, [open, range.from, viewMonth]);

  useEscapeKey(
    () => {
      if (isOpen) {
        close();
        fromInputRef.current?.focus();
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

  // On open, transfer focus into the left calendar's active grid cell so
  // arrow keys and PageUp/Down work immediately. `preventScroll: true`
  // avoids a viewport jump while the portal positions itself.
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

  const handleSelectDate = (date: Date) => {
    if (range.from === null || range.to !== null) {
      // First click of a new selection.
      setRange({ from: date, to: null });
      return;
    }
    // We have `from`, no `to` — second click.
    if (date.getTime() < range.from.getTime()) {
      // User clicked before the start — start over with this as the new from.
      setRange({ from: date, to: null });
      return;
    }
    setRange({ from: range.from, to: date });
    setOpen(false);
  };

  const handlePreset = (preset: DateRangePreset) => {
    const next = preset.getRange();
    setRange({ from: next.from, to: next.to });
    setViewMonth(startOfMonth(next.from));
    setOpen(false);
  };

  const previewRange = useMemo(() => {
    if (range.from === null) return undefined;
    if (range.to !== null) return { from: range.from, to: range.to };
    if (hoverDate === null) return undefined;
    const a = range.from;
    const b = hoverDate;
    return a.getTime() <= b.getTime() ? { from: a, to: b } : { from: b, to: a };
  }, [range, hoverDate]);

  // Keep view month aligned when the committed `from` changes from outside
  // (controlled updates, presets). Render-time conditional setState avoids
  // the cascading-effect lint while staying coherent with the controlled
  // value.
  const fromTime = range.from === null ? null : range.from.getTime();
  const [syncFromTime, setSyncFromTime] = useState(fromTime);
  if (fromTime !== syncFromTime) {
    setSyncFromTime(fromTime);
    if (range.from !== null && !sameMonthYear(viewMonth, range.from)) {
      setViewMonth(startOfMonth(range.from));
    }
  }

  const fromText = range.from !== null ? formatDate(range.from, formatStr, locale) : '';
  const toText = range.to !== null ? formatDate(range.to, formatStr, locale) : '';

  const presetList = presets ?? buildDefaultPresets();

  const onTriggerClick = () => {
    if (!disabled) handleOpen();
  };

  return (
    <div
      ref={mergedTriggerRef}
      data-component="daterangepicker"
      className={cn(
        'relative inline-flex w-full items-center gap-2',
        disabled && 'opacity-50',
        className,
      )}
      aria-label={ariaLabel}
    >
      <div className="relative flex-1">
        <Input
          ref={fromInputRef}
          id={fromInputId}
          type="text"
          readOnly
          disabled={disabled}
          placeholder={placeholderFrom}
          value={fromText}
          {...(error ? { 'aria-invalid': true as const, variant: 'error' as const } : {})}
          onClick={onTriggerClick}
          className="cursor-pointer pr-10"
        />
        <CalendarIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle"
        />
      </div>
      <span className="text-foreground-subtle" aria-hidden="true">
        →
      </span>
      <div className="relative flex-1">
        <Input
          ref={toInputRef}
          id={toInputId}
          type="text"
          readOnly
          disabled={disabled}
          placeholder={placeholderTo}
          value={toText}
          {...(error ? { 'aria-invalid': true as const, variant: 'error' as const } : {})}
          onClick={onTriggerClick}
          className="cursor-pointer pr-10"
        />
        <CalendarIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle"
        />
      </div>

      {isOpen ? (
        <Portal>
          <div
            ref={contentRef}
            role="dialog"
            aria-modal="false"
            aria-label="Choose date range"
            data-side={pos.placement}
            style={{ position: 'absolute', left: pos.x, top: pos.y }}
            className="z-[60] flex rounded-md border border-border bg-surface shadow-lg motion-safe:animate-dialog-in"
          >
            {!hidePresets ? (
              <ul
                aria-label="Range presets"
                className="flex w-36 flex-col gap-0.5 border-r border-border p-2"
              >
                {presetList.map((p) => (
                  <li key={p.label}>
                    <button
                      type="button"
                      onClick={() => handlePreset(p)}
                      className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    >
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex">
              <Calendar
                month={viewMonth}
                onMonthChange={setViewMonth}
                onChange={handleSelectDate}
                onDayHover={setHoverDate}
                weekStartsOn={weekStartsOn}
                {...(minDate !== undefined ? { minDate } : {})}
                {...(maxDate !== undefined ? { maxDate } : {})}
                {...(isDateDisabled !== undefined ? { isDateDisabled } : {})}
                {...(locale !== undefined ? { locale } : {})}
                {...(previewRange !== undefined ? { highlightRange: previewRange } : {})}
              />
              <div className="border-l border-border" />
              <Calendar
                month={addMonths(viewMonth, 1)}
                onMonthChange={(next) => setViewMonth(addMonths(next, -1))}
                onChange={handleSelectDate}
                onDayHover={setHoverDate}
                weekStartsOn={weekStartsOn}
                {...(minDate !== undefined ? { minDate } : {})}
                {...(maxDate !== undefined ? { maxDate } : {})}
                {...(isDateDisabled !== undefined ? { isDateDisabled } : {})}
                {...(locale !== undefined ? { locale } : {})}
                {...(previewRange !== undefined ? { highlightRange: previewRange } : {})}
              />
            </div>
          </div>
        </Portal>
      ) : null}
    </div>
  );
}

function sameMonthYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
