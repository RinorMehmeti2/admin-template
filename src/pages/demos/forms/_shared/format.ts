import type { Currency } from './model';

const FORMATTERS = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: Currency, locale: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let fmt = FORMATTERS.get(key);
  if (fmt === undefined) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    });
    FORMATTERS.set(key, fmt);
  }
  return fmt;
}

export function formatMoney(amount: number, currency: Currency, locale = 'en-US'): string {
  return getFormatter(currency, locale).format(amount);
}
