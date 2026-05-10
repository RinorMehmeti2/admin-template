function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface LocaleParts {
  group: string;
  decimal: string;
  minus: string;
}

export function getLocaleParts(locale: string): LocaleParts {
  let group = ',';
  let decimal = '.';
  let minus = '-';
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
    for (const p of parts) {
      if (p.type === 'group') group = p.value;
      else if (p.type === 'decimal') decimal = p.value;
      else if (p.type === 'minusSign') minus = p.value;
    }
  } catch {
    // Fall through to ASCII defaults if the runtime rejects the locale.
  }
  return { group, decimal, minus };
}

export interface ParseOptions {
  allowNegative?: boolean;
}

export function parseNumber(input: string, locale: string, options?: ParseOptions): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const { group, decimal, minus } = getLocaleParts(locale);

  let s = trimmed;
  s = s.replace(new RegExp(escapeRegExp(minus), 'g'), '-');
  if (group !== '') s = s.replace(new RegExp(escapeRegExp(group), 'g'), '');
  // Locales sometimes group with NBSP / narrow NBSP / thin space; strip any
  // whitespace defensively even when Intl reports a different group separator.
  s = s.replace(/\s/g, '');
  if (decimal !== '.') s = s.replace(new RegExp(escapeRegExp(decimal), 'g'), '.');
  s = s.replace(/[^0-9.-]/g, '');
  if (s === '' || s === '-' || s === '.' || s === '-.') return null;

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  if (options?.allowNegative === false && n < 0) return Math.abs(n);
  return n;
}

export function formatForDisplay(
  value: number | null | undefined,
  locale: string,
  options?: Intl.NumberFormatOptions,
  precision?: number,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  const opts: Intl.NumberFormatOptions = { ...options };
  if (precision !== undefined) {
    opts.minimumFractionDigits = precision;
    opts.maximumFractionDigits = precision;
  }
  return new Intl.NumberFormat(locale, opts).format(value);
}

export function formatForEdit(
  value: number | null | undefined,
  locale: string,
  precision?: number,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  const opts: Intl.NumberFormatOptions = { useGrouping: false };
  if (precision !== undefined) {
    opts.minimumFractionDigits = precision;
    opts.maximumFractionDigits = precision;
  } else {
    opts.maximumFractionDigits = 20;
  }
  return new Intl.NumberFormat(locale, opts).format(value);
}

export function clampToRange(value: number, min?: number, max?: number): number {
  let v = value;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

export function roundToStep(value: number, step: number, base: number): number {
  if (step <= 0 || !Number.isFinite(step)) return value;
  const offset = Number.isFinite(base) ? base : 0;
  const n = Math.round((value - offset) / step) * step + offset;
  // Floating-point cleanup: 0.1 + 0.2 → 0.3, not 0.30000000000000004.
  return Number(n.toPrecision(15));
}
