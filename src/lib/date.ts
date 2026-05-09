/*
 * Centralized date helpers — all built on date-fns v4 under the hood.
 *
 * Why this file exists:
 *   The rest of the codebase imports from `@/lib/date`, NOT from 'date-fns'
 *   directly. Centralizing the surface lets us swap libraries, audit usage,
 *   add locale wiring in one place, and keep timezone behavior consistent.
 *
 * Timezone & locale model:
 *   date-fns operates in the runtime's LOCAL timezone — every Date object
 *   passed in is treated as a local-time instant. We follow the same rule:
 *   `buildCalendarMatrix(new Date(2026, 4, 1))` builds the May 2026 grid in
 *   the user's local zone. Persisting dates as `YYYY-MM-DD` strings (no time
 *   component) keeps them zone-independent; converting to a Date for display
 *   uses the browser's zone. Consumers needing UTC must convert before
 *   handing dates to these helpers.
 *
 *   Locale defaults to whatever date-fns ships (en-US). Callers that need a
 *   different locale should pass one through `format`, `parse`, and the
 *   weekday helpers.
 */

import {
  addDays as dfAddDays,
  addMonths as dfAddMonths,
  endOfMonth as dfEndOfMonth,
  format as dfFormat,
  isAfter as dfIsAfter,
  isBefore as dfIsBefore,
  isSameDay as dfIsSameDay,
  isSameMonth as dfIsSameMonth,
  isToday as dfIsToday,
  isValid as dfIsValid,
  parse as dfParse,
  startOfDay as dfStartOfDay,
  startOfMonth as dfStartOfMonth,
  startOfWeek as dfStartOfWeek,
  subMonths as dfSubMonths,
  type Locale,
} from 'date-fns';

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Re-exports — kept narrow, named, and explicit. */
export const addDays = dfAddDays;
export const addMonths = dfAddMonths;
export const endOfMonth = dfEndOfMonth;
export const isSameDay = dfIsSameDay;
export const isSameMonth = dfIsSameMonth;
export const isToday = dfIsToday;
export const isValid = dfIsValid;
export const startOfDay = dfStartOfDay;
export const startOfMonth = dfStartOfMonth;
export const startOfWeek = dfStartOfWeek;
export const subMonths = dfSubMonths;

/**
 * Format a date with optional locale.
 * Example: formatDate(d, 'PP') → "May 9, 2026"
 */
export function formatDate(date: Date, formatStr: string, locale?: Locale): string {
  return locale !== undefined ? dfFormat(date, formatStr, { locale }) : dfFormat(date, formatStr);
}

/**
 * Parse a string against a format. Returns Invalid Date when parsing fails;
 * pair with `isValid` before consuming.
 */
export function parseDate(
  input: string,
  formatStr: string,
  reference: Date = new Date(),
  locale?: Locale,
): Date {
  return locale !== undefined
    ? dfParse(input, formatStr, reference, { locale })
    : dfParse(input, formatStr, reference);
}

/**
 * Build a 6×7 calendar matrix anchored on the month containing `monthDate`.
 * Always returns 6 rows of 7 days — including spillover from sibling months
 * — so the grid layout is stable regardless of which weekday the month
 * starts on.
 */
export function buildCalendarMatrix(monthDate: Date, weekStartsOn: WeekStartsOn): Date[][] {
  const start = dfStartOfWeek(dfStartOfMonth(monthDate), { weekStartsOn });
  const matrix: Date[][] = [];
  for (let row = 0; row < 6; row++) {
    const week: Date[] = [];
    for (let col = 0; col < 7; col++) {
      week.push(dfAddDays(start, row * 7 + col));
    }
    matrix.push(week);
  }
  return matrix;
}

/**
 * Inclusive day-level range check. Accepts `from`/`to` in either order;
 * returns true if `date` falls on or between them at day granularity.
 * Returns false if either bound is missing.
 */
export function isInRange(
  date: Date,
  from: Date | null | undefined,
  to: Date | null | undefined,
): boolean {
  if (from === null || from === undefined || to === null || to === undefined) return false;
  const d = dfStartOfDay(date).getTime();
  const a = dfStartOfDay(from).getTime();
  const b = dfStartOfDay(to).getTime();
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return d >= lo && d <= hi;
}

/**
 * Clamp a date to a [min, max] window at day granularity. Either bound may
 * be omitted. If min > max the result is undefined behavior — callers should
 * validate inputs.
 */
export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  const d = dfStartOfDay(date);
  if (min !== null && min !== undefined && dfIsBefore(d, dfStartOfDay(min))) {
    return dfStartOfDay(min);
  }
  if (max !== null && max !== undefined && dfIsAfter(d, dfStartOfDay(max))) {
    return dfStartOfDay(max);
  }
  return date;
}

export interface IsDayDisabledOptions {
  minDate?: Date | null | undefined;
  maxDate?: Date | null | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;
}

/**
 * Combined disabled check used by Calendar/DatePicker. Order:
 *   1. Below minDate → disabled
 *   2. Above maxDate → disabled
 *   3. Caller predicate → disabled
 */
export function isDayDisabled(date: Date, options: IsDayDisabledOptions = {}): boolean {
  const { minDate, maxDate, isDateDisabled } = options;
  const d = dfStartOfDay(date);
  if (minDate !== null && minDate !== undefined && dfIsBefore(d, dfStartOfDay(minDate))) {
    return true;
  }
  if (maxDate !== null && maxDate !== undefined && dfIsAfter(d, dfStartOfDay(maxDate))) {
    return true;
  }
  if (isDateDisabled !== undefined && isDateDisabled(date)) return true;
  return false;
}

/**
 * Return the 7 weekday header labels in display order, starting on
 * `weekStartsOn`. `formatStr` defaults to 'EEEEEE' (very short, e.g. "Mo")
 * which works well in narrow calendar columns.
 */
export function getWeekdayLabels(
  weekStartsOn: WeekStartsOn,
  locale?: Locale,
  formatStr: string = 'EEEEEE',
): string[] {
  // Pick any week and read its 7 days. We use a known date and shift to the
  // configured first weekday; the actual date picked is irrelevant.
  const reference = dfStartOfWeek(new Date(2024, 0, 7), { weekStartsOn });
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    labels.push(formatDate(dfAddDays(reference, i), formatStr, locale));
  }
  return labels;
}
