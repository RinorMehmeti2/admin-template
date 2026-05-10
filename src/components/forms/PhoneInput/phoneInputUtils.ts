import {
  AsYouType,
  formatIncompletePhoneNumber,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';

export type { CountryCode };

export interface CountryEntry {
  code: CountryCode;
  name: string;
  callingCode: string;
}

const REGIONAL_INDICATOR_A = 0x1f1e6;

/** Returns the regional-indicator-pair flag emoji for a 2-letter country code. */
export function getFlagEmoji(code: string): string {
  if (code.length !== 2) return '';
  const a = code.toUpperCase().charCodeAt(0);
  const b = code.toUpperCase().charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return '';
  return String.fromCodePoint(REGIONAL_INDICATOR_A + (a - 65), REGIONAL_INDICATOR_A + (b - 65));
}

/** Localized country name via Intl.DisplayNames; falls back to the ISO code. */
export function getCountryName(code: CountryCode, locale = 'en'): string {
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') return code;
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

const listCache = new Map<string, ReadonlyArray<CountryEntry>>();

export function getCountryEntries(locale = 'en'): ReadonlyArray<CountryEntry> {
  const cached = listCache.get(locale);
  if (cached !== undefined) return cached;
  const entries = getCountries().map<CountryEntry>((code) => ({
    code,
    name: getCountryName(code, locale),
    callingCode: getCountryCallingCode(code),
  }));
  entries.sort((a, b) => a.name.localeCompare(b.name, locale));
  const frozen = entries as ReadonlyArray<CountryEntry>;
  listCache.set(locale, frozen);
  return frozen;
}

/** Format raw national digits/text into the country's national display style. */
export function formatNational(input: string, country: CountryCode): string {
  if (input === '') return '';
  return formatIncompletePhoneNumber(input, country);
}

/**
 * If input begins with a `+`, attempt to detect the country and return a
 * formatted national display string. For complete numbers we use
 * `parsePhoneNumberFromString().formatNational()` so trunk prefixes are
 * preserved (e.g. GB `020 7946 0958`). For partial numbers we fall back to
 * `AsYouType` which emits raw national digits as the user keeps typing.
 * Returns null when no country can be inferred yet.
 */
export function detectCountryFromInternational(
  input: string,
): { country: CountryCode; national: string } | null {
  if (!input.startsWith('+')) return null;
  const parsed = parsePhoneNumberFromString(input);
  if (parsed !== undefined && parsed.country !== undefined) {
    return { country: parsed.country, national: parsed.formatNational() };
  }
  const ayt = new AsYouType();
  ayt.input(input);
  const country = ayt.getCountry();
  if (country === undefined) return null;
  return { country, national: ayt.getNationalNumber() };
}

export function toE164(national: string, country: CountryCode): string | null {
  if (national.replace(/\D/g, '') === '') return null;
  const parsed = parsePhoneNumberFromString(national, country);
  if (parsed === undefined) return null;
  if (!parsed.isValid()) return null;
  return parsed.number;
}

export function isValidNational(national: string, country: CountryCode): boolean {
  if (national.replace(/\D/g, '') === '') return false;
  return isValidPhoneNumber(national, country);
}

/**
 * Parse an E.164 string into country + national display string. Returns null
 * if the input is empty, malformed, or the country can't be resolved.
 */
export function parseE164(value: string): { country: CountryCode; national: string } | null {
  if (value === '') return null;
  const parsed = parsePhoneNumberFromString(value);
  if (parsed === undefined || parsed.country === undefined) return null;
  return {
    country: parsed.country,
    national: parsed.formatNational(),
  };
}

/** Map a BCP-47 locale (e.g. `en-US`) to a region code, if supported. */
export function getCountryFromLocale(locale: string | undefined): CountryCode | null {
  if (locale === undefined || locale === '') return null;
  try {
    const region = new Intl.Locale(locale).maximize().region;
    if (region !== undefined && isSupportedCountry(region)) return region;
  } catch {
    // ignored
  }
  return null;
}
