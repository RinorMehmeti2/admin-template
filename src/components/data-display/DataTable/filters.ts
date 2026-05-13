import type { FilterFn } from '@tanstack/react-table';

/* Faceted filter functions for DataTable's `meta.filterVariant`. */

/** value: string[] (multi-select). Empty list = pass-through. */
export const arrIncludesSome: FilterFn<unknown> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  const cell = row.getValue(columnId);
  return filterValue.includes(cell as string);
};

/** value: [min?, max?] (range). Undefined/NaN endpoints are open. */
export const inNumberRange: FilterFn<unknown> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue)) return true;
  const [min, max] = filterValue as [number | undefined, number | undefined];
  const raw = row.getValue<unknown>(columnId);
  const v = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(v)) return true;
  if (typeof min === 'number' && Number.isFinite(min) && v < min) return false;
  if (typeof max === 'number' && Number.isFinite(max) && v > max) return false;
  return true;
};

/** value: { from?: Date; to?: Date }. */
export const inDateRange: FilterFn<unknown> = (row, columnId, filterValue) => {
  if (filterValue === null || filterValue === undefined) return true;
  const { from, to } = filterValue as { from?: Date | null; to?: Date | null };
  if (from === null || from === undefined) {
    if (to === null || to === undefined) return true;
  }
  const raw = row.getValue<unknown>(columnId);
  let d: Date;
  if (raw instanceof Date) {
    d = raw;
  } else if (typeof raw === 'string' || typeof raw === 'number') {
    d = new Date(raw);
  } else {
    return true;
  }
  if (Number.isNaN(d.getTime())) return true;
  const t = d.getTime();
  if (from instanceof Date && t < startOfDay(from).getTime()) return false;
  if (to instanceof Date && t > endOfDay(to).getTime()) return false;
  return true;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
