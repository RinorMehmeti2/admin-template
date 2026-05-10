import { useMemo, useRef, type Ref, type HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/primitives/IconButton';
import { RovingFocusGrid, useRovingFocusGridItem } from '@/hooks/useRovingFocusGrid';
import {
  addMonths,
  buildCalendarMatrix,
  formatDate,
  getWeekdayLabels,
  isDayDisabled as computeIsDayDisabled,
  isInRange,
  isSameDay,
  isSameMonth,
  isToday as computeIsToday,
  subMonths,
  type WeekStartsOn,
} from '@/lib/date';

export interface CalendarHighlightRange {
  from: Date;
  to: Date;
}

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  ref?: Ref<HTMLDivElement>;
  /** Anchor month — only the month/year are read. */
  month: Date;
  onMonthChange?: ((next: Date) => void) | undefined;
  value?: Date | undefined;
  onChange?: ((next: Date) => void) | undefined;
  weekStartsOn?: WeekStartsOn;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  /** Subtle range fill — both ends required. Used by DateRangePicker. */
  highlightRange?: CalendarHighlightRange | undefined;
  onDayHover?: ((date: Date | null) => void) | undefined;
  locale?: Locale | undefined;
  /** Render days from the previous/next month in the grid. Default true. */
  showOutsideDays?: boolean;
  /** Optional override for the grid's accessible name. */
  ariaLabel?: string | undefined;
}

interface DayCellProps {
  row: number;
  col: number;
  date: Date;
  inMonth: boolean;
  isSelected: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  isToday: boolean;
  disabled: boolean;
  showOutsideDays: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function DayCell({
  row,
  col,
  date,
  inMonth,
  isSelected,
  isStart,
  isEnd,
  inRange,
  isToday,
  disabled,
  showOutsideDays,
  onSelect,
  onHover,
  onLeave,
}: DayCellProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusGridItem(row, col, ref);

  if (!showOutsideDays && !inMonth) {
    // Empty placeholder — keeps the 7-col grid intact while hiding spillover.
    return <div role="gridcell" aria-hidden="true" className="h-9 w-9" />;
  }

  const dayNum = date.getDate();
  const isHighlightEdge = isStart || isEnd;

  return (
    <button
      ref={ref}
      type="button"
      role="gridcell"
      tabIndex={tabIndex}
      aria-selected={isSelected ? true : undefined}
      aria-current={isToday ? 'date' : undefined}
      aria-disabled={disabled ? true : undefined}
      aria-label={formatDate(date, 'PPPP')}
      disabled={disabled}
      data-day={formatDate(date, 'yyyy-MM-dd')}
      data-outside={!inMonth || undefined}
      data-today={isToday || undefined}
      data-selected={isSelected || undefined}
      data-in-range={inRange || undefined}
      data-range-edge={isHighlightEdge || undefined}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        'h-9 w-9 rounded-md text-sm font-medium tabular-nums transition-colors',
        'flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Outside-month dim
        !inMonth && 'text-foreground-subtle/60',
        // Today border (only when not selected/edge)
        isToday && !isSelected && !isHighlightEdge && 'border border-border-strong',
        // Range fill (subtle bg between edges)
        inRange && !isSelected && !isHighlightEdge && 'bg-surface-muted',
        // Selected single date
        isSelected && !isHighlightEdge && 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Range edges (start/end)
        isHighlightEdge && 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Hover (only when not selected/edge/disabled)
        !isSelected && !isHighlightEdge && !disabled && 'hover:bg-surface-muted',
        // Disabled
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {dayNum}
    </button>
  );
}

export function Calendar({
  ref,
  month,
  onMonthChange,
  value,
  onChange,
  weekStartsOn = 1,
  minDate,
  maxDate,
  isDateDisabled,
  highlightRange,
  onDayHover,
  locale,
  showOutsideDays = true,
  className,
  ariaLabel,
  ...rest
}: CalendarProps) {
  const matrix = useMemo(() => buildCalendarMatrix(month, weekStartsOn), [month, weekStartsOn]);

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(weekStartsOn, locale),
    [weekStartsOn, locale],
  );

  const monthLabel = useMemo(() => formatDate(month, 'LLLL yyyy', locale), [month, locale]);

  // Initial focus target — value if in this month, else today if in this
  // month, else first non-disabled day in the visible month.
  const defaultFocus = useMemo(() => {
    const findCell = (predicate: (date: Date) => boolean): { row: number; col: number } | null => {
      for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r]!;
        for (let c = 0; c < row.length; c++) {
          if (predicate(row[c]!)) return { row: r, col: c };
        }
      }
      return null;
    };
    if (value !== undefined && isSameMonth(value, month)) {
      const found = findCell((d) => isSameDay(d, value));
      if (found !== null) return found;
    }
    const today = findCell((d) => computeIsToday(d) && isSameMonth(d, month));
    if (today !== null) return today;
    const firstEnabled = findCell(
      (d) =>
        isSameMonth(d, month) && !computeIsDayDisabled(d, { minDate, maxDate, isDateDisabled }),
    );
    if (firstEnabled !== null) return firstEnabled;
    return { row: 0, col: 0 };
  }, [matrix, month, value, minDate, maxDate, isDateDisabled]);

  const handleMonthChange = (next: Date) => {
    onMonthChange?.(next);
  };

  const handleSelect = (date: Date) => {
    if (computeIsDayDisabled(date, { minDate, maxDate, isDateDisabled })) return;
    onChange?.(date);
  };

  return (
    <div
      ref={ref}
      data-component="calendar"
      className={cn('inline-block select-none rounded-md bg-surface text-foreground', className)}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2 px-2 pt-2">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Previous month"
          onClick={() => handleMonthChange(subMonths(month, 1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </IconButton>
        <div className="flex-1 text-center text-sm font-semibold" aria-live="polite">
          {monthLabel}
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Next month"
          onClick={() => handleMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>

      <RovingFocusGrid
        loop={false}
        defaultRow={defaultFocus.row}
        defaultCol={defaultFocus.col}
        onPageNavigate={(direction, _row, _col, e) => {
          e.preventDefault();
          handleMonthChange(addMonths(month, direction));
        }}
      >
        <div
          role="grid"
          aria-label={ariaLabel ?? monthLabel}
          className="grid grid-cols-7 gap-0.5 p-2"
        >
          <div role="row" className="contents">
            {weekdayLabels.map((label, i) => (
              <div
                key={i}
                role="columnheader"
                className="flex h-8 items-center justify-center text-xs font-medium uppercase tracking-wide text-foreground-muted"
              >
                {label}
              </div>
            ))}
          </div>
          {matrix.map((week, r) => (
            <div role="row" className="contents" key={r}>
              {week.map((date, c) => {
                const inMonth = isSameMonth(date, month);
                const isSelected = value !== undefined && isSameDay(date, value);
                const isStart =
                  highlightRange !== undefined && isSameDay(date, highlightRange.from);
                const isEnd = highlightRange !== undefined && isSameDay(date, highlightRange.to);
                const inRange =
                  highlightRange !== undefined &&
                  isInRange(date, highlightRange.from, highlightRange.to);
                const disabled = computeIsDayDisabled(date, {
                  minDate,
                  maxDate,
                  isDateDisabled,
                });
                return (
                  <DayCell
                    key={c}
                    row={r}
                    col={c}
                    date={date}
                    inMonth={inMonth}
                    isSelected={isSelected}
                    isStart={isStart}
                    isEnd={isEnd}
                    inRange={inRange}
                    isToday={computeIsToday(date)}
                    disabled={disabled}
                    showOutsideDays={showOutsideDays}
                    onSelect={() => handleSelect(date)}
                    onHover={() => onDayHover?.(date)}
                    onLeave={() => onDayHover?.(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </RovingFocusGrid>
    </div>
  );
}
