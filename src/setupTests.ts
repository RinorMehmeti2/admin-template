import '@testing-library/jest-dom/vitest';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as axeMatchers from 'vitest-axe/matchers';
import 'vitest-axe/extend-expect';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

// Init i18n for tests without LanguageDetector (Node 25 + jsdom localStorage
// is a plain object, which the detector's caches: ['localStorage'] writes to
// and breaks the Storage interface for other tests).
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, es: { translation: es } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

expect.extend(axeMatchers);

afterEach(() => {
  cleanup();
});

/*
 * jsdom polyfills required by ProseMirror (TipTap). jsdom omits a handful of
 * layout / hit-testing APIs that ProseMirror calls during selection and
 * scroll-into-view. Stub them to no-ops with reasonable shapes — enough for
 * editor mount + command dispatch to succeed in tests. These are not used to
 * test layout; they just keep dispatch from throwing.
 */
// Node 25 enables --experimental-webstorage, which leaks a plain-object
// `localStorage` onto globalThis that has no `.clear`/`.removeItem`/etc.
// jsdom installs its own Storage on `window`, but the broken native one wins
// in some import orders. Replace it unconditionally with a clean Storage-like
// polyfill before any module touches it.
if (typeof window !== 'undefined') {
  const installStorage = (key: 'localStorage' | 'sessionStorage') => {
    const data = new Map<string, string>();
    const store: Storage = {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (k: string) => (data.has(k) ? (data.get(k) as string) : null),
      key: (i: number) => Array.from(data.keys())[i] ?? null,
      removeItem: (k: string) => {
        data.delete(k);
      },
      setItem: (k: string, v: string) => {
        data.set(k, String(v));
      },
    };
    Object.defineProperty(window, key, { configurable: true, value: store });
    Object.defineProperty(globalThis, key, { configurable: true, value: store });
  };
  if (typeof window.localStorage?.clear !== 'function') installStorage('localStorage');
  if (typeof window.sessionStorage?.clear !== 'function') installStorage('sessionStorage');

  if (typeof document.elementFromPoint !== 'function') {
    document.elementFromPoint = (() => null) as Document['elementFromPoint'];
  }
  if (typeof Range.prototype.getClientRects !== 'function') {
    Range.prototype.getClientRects = (() => ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    })) as unknown as Range['getClientRects'];
  }
  if (typeof Range.prototype.getBoundingClientRect !== 'function') {
    Range.prototype.getBoundingClientRect = (() => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    })) as Range['getBoundingClientRect'];
  }
  // Text nodes lack getClientRects in jsdom; ProseMirror calls it on them.
  // Patch via Node.prototype as a fallback — only sets if missing.
  const NodeProto = Node.prototype as Node & {
    getClientRects?: () => DOMRectList;
  };
  if (typeof NodeProto.getClientRects !== 'function') {
    NodeProto.getClientRects = (() => ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    })) as unknown as () => DOMRectList;
  }
}
