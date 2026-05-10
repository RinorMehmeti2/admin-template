export { PhoneInput } from './PhoneInput';
export type { PhoneInputProps, PhoneInputHandle } from './PhoneInput';
export {
  formatNational,
  parseE164,
  toE164,
  isValidNational,
  detectCountryFromInternational,
  getCountryEntries,
  getCountryName,
  getFlagEmoji,
  getCountryFromLocale,
  type CountryCode,
  type CountryEntry,
} from './phoneInputUtils';
