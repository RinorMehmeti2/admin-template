import type { Country, TagSuggestion } from './model';

export const COUNTRIES: ReadonlyArray<Country> = [
  { code: 'us', name: 'United States' },
  { code: 'ca', name: 'Canada' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'br', name: 'Brazil' },
  { code: 'in', name: 'India' },
  { code: 'mx', name: 'Mexico' },
  { code: 'za', name: 'South Africa' },
  { code: 'kr', name: 'South Korea' },
];

export const TAG_SUGGESTIONS: ReadonlyArray<TagSuggestion> = [
  { value: 'frontend', label: 'frontend' },
  { value: 'backend', label: 'backend' },
  { value: 'design', label: 'design' },
  { value: 'docs', label: 'docs' },
  { value: 'a11y', label: 'a11y' },
  { value: 'performance', label: 'performance' },
  { value: 'testing', label: 'testing' },
];

export const BRAND_PRESETS: ReadonlyArray<string> = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];
