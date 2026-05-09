import { describe, it, expect } from 'vitest';
import {
  addMonths,
  buildCalendarMatrix,
  clampDate,
  formatDate,
  getWeekdayLabels,
  isDayDisabled,
  isInRange,
  isSameDay,
  parseDate,
} from '@/lib/date';
import { isValid } from 'date-fns';

const d = (y: number, m: number, day: number): Date => new Date(y, m - 1, day);

describe('buildCalendarMatrix', () => {
  it('returns 6 rows of 7 days', () => {
    const matrix = buildCalendarMatrix(d(2026, 5, 1), 1);
    expect(matrix).toHaveLength(6);
    for (const row of matrix) expect(row).toHaveLength(7);
  });

  it('first cell matches the start of the week of the 1st (weekStartsOn=1)', () => {
    // May 1, 2026 is a Friday. With Monday-start weeks, the matrix starts
    // on Monday Apr 27, 2026.
    const matrix = buildCalendarMatrix(d(2026, 5, 1), 1);
    expect(isSameDay(matrix[0]![0]!, d(2026, 4, 27))).toBe(true);
  });

  it('first cell matches Sunday when weekStartsOn=0', () => {
    // For May 2026, Sunday-start grid begins Apr 26, 2026.
    const matrix = buildCalendarMatrix(d(2026, 5, 1), 0);
    expect(isSameDay(matrix[0]![0]!, d(2026, 4, 26))).toBe(true);
  });

  it('contains the entire month', () => {
    const matrix = buildCalendarMatrix(d(2026, 5, 1), 1);
    const flat = matrix.flat();
    for (let day = 1; day <= 31; day++) {
      expect(flat.some((dt) => isSameDay(dt, d(2026, 5, day)))).toBe(true);
    }
  });
});

describe('isInRange', () => {
  it('returns true for a date inside the range', () => {
    expect(isInRange(d(2026, 5, 10), d(2026, 5, 1), d(2026, 5, 20))).toBe(true);
  });

  it('is inclusive on both ends', () => {
    expect(isInRange(d(2026, 5, 1), d(2026, 5, 1), d(2026, 5, 20))).toBe(true);
    expect(isInRange(d(2026, 5, 20), d(2026, 5, 1), d(2026, 5, 20))).toBe(true);
  });

  it('returns false outside the range', () => {
    expect(isInRange(d(2026, 4, 30), d(2026, 5, 1), d(2026, 5, 20))).toBe(false);
    expect(isInRange(d(2026, 5, 21), d(2026, 5, 1), d(2026, 5, 20))).toBe(false);
  });

  it('handles reversed bounds', () => {
    expect(isInRange(d(2026, 5, 10), d(2026, 5, 20), d(2026, 5, 1))).toBe(true);
  });

  it('returns false when either bound is missing', () => {
    expect(isInRange(d(2026, 5, 10), null, d(2026, 5, 20))).toBe(false);
    expect(isInRange(d(2026, 5, 10), d(2026, 5, 1), undefined)).toBe(false);
  });
});

describe('clampDate', () => {
  it('returns date when within bounds', () => {
    const result = clampDate(d(2026, 5, 10), d(2026, 5, 1), d(2026, 5, 20));
    expect(isSameDay(result, d(2026, 5, 10))).toBe(true);
  });

  it('clamps to min when below', () => {
    const result = clampDate(d(2026, 4, 1), d(2026, 5, 1), d(2026, 5, 20));
    expect(isSameDay(result, d(2026, 5, 1))).toBe(true);
  });

  it('clamps to max when above', () => {
    const result = clampDate(d(2026, 6, 5), d(2026, 5, 1), d(2026, 5, 20));
    expect(isSameDay(result, d(2026, 5, 20))).toBe(true);
  });

  it('handles undefined bounds', () => {
    expect(isSameDay(clampDate(d(2026, 5, 10)), d(2026, 5, 10))).toBe(true);
  });
});

describe('isDayDisabled', () => {
  it('returns true below minDate', () => {
    expect(isDayDisabled(d(2026, 4, 30), { minDate: d(2026, 5, 1) })).toBe(true);
  });

  it('returns true above maxDate', () => {
    expect(isDayDisabled(d(2026, 5, 21), { maxDate: d(2026, 5, 20) })).toBe(true);
  });

  it('returns true when caller predicate matches', () => {
    // May 11, 2026 is a Monday → enabled.
    expect(
      isDayDisabled(d(2026, 5, 11), {
        isDateDisabled: (dt) => dt.getDay() === 0 || dt.getDay() === 6,
      }),
    ).toBe(false);
    // May 9, 2026 is a Saturday → disabled.
    expect(
      isDayDisabled(d(2026, 5, 9), {
        isDateDisabled: (dt) => dt.getDay() === 0 || dt.getDay() === 6,
      }),
    ).toBe(true);
  });

  it('returns false within bounds', () => {
    expect(isDayDisabled(d(2026, 5, 10), { minDate: d(2026, 5, 1), maxDate: d(2026, 5, 20) })).toBe(
      false,
    );
  });
});

describe('addMonths', () => {
  it('adds months correctly', () => {
    expect(isSameDay(addMonths(d(2026, 5, 9), 1), d(2026, 6, 9))).toBe(true);
    expect(isSameDay(addMonths(d(2026, 5, 9), -2), d(2026, 3, 9))).toBe(true);
  });
});

describe('formatDate / parseDate', () => {
  it('formats with PP', () => {
    expect(formatDate(d(2026, 5, 9), 'PP')).toMatch(/May.*9.*2026/);
  });

  it('round-trips through parse for a known format', () => {
    const formatted = formatDate(d(2026, 5, 9), 'yyyy-MM-dd');
    expect(formatted).toBe('2026-05-09');
    const parsed = parseDate('2026-05-09', 'yyyy-MM-dd');
    expect(isValid(parsed)).toBe(true);
    expect(isSameDay(parsed, d(2026, 5, 9))).toBe(true);
  });

  it('returns Invalid Date for unparseable input', () => {
    const parsed = parseDate('not-a-date', 'yyyy-MM-dd');
    expect(isValid(parsed)).toBe(false);
  });
});

describe('getWeekdayLabels', () => {
  it('returns 7 labels', () => {
    expect(getWeekdayLabels(1)).toHaveLength(7);
    expect(getWeekdayLabels(0)).toHaveLength(7);
  });

  it('first label is the configured first day', () => {
    const monStart = getWeekdayLabels(1, undefined, 'EEE');
    const sunStart = getWeekdayLabels(0, undefined, 'EEE');
    expect(monStart[0]).toBe('Mon');
    expect(sunStart[0]).toBe('Sun');
  });
});
