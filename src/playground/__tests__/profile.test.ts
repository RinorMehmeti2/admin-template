import { describe, it, expect } from 'vitest';
import { ALL_STYLE_SECTIONS, filterByProfile, resolveSections } from '../profile';
import type { StyleOverlayValues } from '../types';

describe('resolveSections', () => {
  it('returns every section when profile is undefined', () => {
    const set = resolveSections(undefined);
    expect(set.size).toBe(ALL_STYLE_SECTIONS.length);
    for (const s of ALL_STYLE_SECTIONS) expect(set.has(s)).toBe(true);
  });

  it('returns every section for kind=all', () => {
    expect(resolveSections({ kind: 'all' }).size).toBe(ALL_STYLE_SECTIONS.length);
  });

  it('returns empty set for kind=none', () => {
    expect(resolveSections({ kind: 'none' }).size).toBe(0);
  });

  it('returns only listed sections for kind=pick', () => {
    const set = resolveSections({ kind: 'pick', sections: ['size', 'className'] });
    expect(Array.from(set).sort()).toEqual(['className', 'size']);
  });

  it('excludes listed sections for kind=omit', () => {
    const set = resolveSections({ kind: 'omit', sections: ['typography'] });
    expect(set.has('typography')).toBe(false);
    expect(set.has('spacing')).toBe(true);
    expect(set.has('className')).toBe(true);
  });
});

describe('filterByProfile', () => {
  const fullValues: StyleOverlayValues = {
    paddingTop: 8,
    paddingRight: 8,
    marginLeft: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    backgroundColor: '#fff',
    opacity: 0.5,
    width: '200px',
    fontSize: 14,
    fontWeight: '500',
    boxShadow: 'md',
    className: 'extra-class',
  };

  it('returns identical shape for all-profile', () => {
    const out = filterByProfile(fullValues, { kind: 'all' });
    expect(out).toEqual(fullValues);
  });

  it('drops every key for none-profile', () => {
    const out = filterByProfile(fullValues, { kind: 'none' });
    expect(Object.keys(out)).toHaveLength(0);
  });

  it('keeps only keys belonging to picked sections', () => {
    const out = filterByProfile(fullValues, {
      kind: 'pick',
      sections: ['size', 'className'],
    });
    expect(out).toEqual({ width: '200px', className: 'extra-class' });
  });

  it('drops keys belonging to omitted sections', () => {
    const out = filterByProfile(fullValues, {
      kind: 'omit',
      sections: ['typography'],
    });
    expect(out.fontSize).toBeUndefined();
    expect(out.fontWeight).toBeUndefined();
    expect(out.paddingTop).toBe(8);
    expect(out.boxShadow).toBe('md');
  });

  it('returns empty object when values are undefined', () => {
    expect(filterByProfile(undefined, { kind: 'all' })).toEqual({});
  });

  it('ignores undefined values inside the input', () => {
    // Build a Partial<StyleOverlayValues> with paddingTop literally set to
    // undefined — exactOptionalPropertyTypes blocks the shorthand, so we
    // splice it onto the object after construction.
    const raw: StyleOverlayValues = { width: '120px' };
    Object.assign(raw, { paddingTop: undefined });
    const out = filterByProfile(raw, { kind: 'all' });
    expect(out.width).toBe('120px');
    expect('paddingTop' in out).toBe(false);
  });
});
