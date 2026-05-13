import type { StyleOverlayProfile, StyleOverlaySection, StyleOverlayValues } from './types';

/*
 * Pure helpers for the per-component overlay profile.
 *
 *  - ALL_STYLE_SECTIONS  — canonical section ordering.
 *  - STYLE_SECTION_KEYS  — section → which StyleOverlayValues keys it owns.
 *                          New section ⇒ new entry here OR the filter will
 *                          drop values for it.
 *  - resolveSections     — profile → enabled section set.
 *  - filterByProfile     — drop values whose section is disabled, so codegen
 *                          + live preview never emit hidden overrides.
 */

export const ALL_STYLE_SECTIONS: ReadonlyArray<StyleOverlaySection> = [
  'spacing',
  'border',
  'colors',
  'size',
  'typography',
  'effects',
  'className',
];

export const STYLE_SECTION_KEYS: Record<
  StyleOverlaySection,
  ReadonlyArray<keyof StyleOverlayValues>
> = {
  spacing: [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
  ],
  border: ['borderWidth', 'borderStyle', 'borderColor', 'borderRadius'],
  colors: ['backgroundColor', 'color', 'opacity'],
  size: ['width', 'height', 'minWidth', 'maxWidth'],
  typography: ['fontSize', 'fontWeight', 'letterSpacing'],
  effects: ['boxShadow'],
  className: ['className'],
};

export function resolveSections(
  profile: StyleOverlayProfile | undefined,
): ReadonlySet<StyleOverlaySection> {
  if (profile === undefined || profile.kind === 'all') return new Set(ALL_STYLE_SECTIONS);
  if (profile.kind === 'none') return new Set();
  if (profile.kind === 'pick') return new Set(profile.sections);
  const set = new Set<StyleOverlaySection>(ALL_STYLE_SECTIONS);
  for (const s of profile.sections) set.delete(s);
  return set;
}

export function filterByProfile(
  values: StyleOverlayValues | undefined,
  profile: StyleOverlayProfile | undefined,
): StyleOverlayValues {
  if (values === undefined) return {};
  const sections = resolveSections(profile);
  const all = sections.size === ALL_STYLE_SECTIONS.length;
  // Compute the allowed-keys set up front. The `all` shortcut still walks
  // the loop so `undefined` values are dropped (a bare `{ ...values }` would
  // preserve `paddingTop: undefined` and pollute downstream consumers).
  const allowed = new Set<keyof StyleOverlayValues>();
  for (const sec of sections) for (const k of STYLE_SECTION_KEYS[sec]) allowed.add(k);
  const out: StyleOverlayValues = {};
  for (const key of Object.keys(values) as Array<keyof StyleOverlayValues>) {
    if (!all && !allowed.has(key)) continue;
    const v = values[key];
    if (v === undefined) continue;
    Object.assign(out, { [key]: v });
  }
  return out;
}
