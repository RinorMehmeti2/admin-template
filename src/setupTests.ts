import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

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
if (typeof window !== 'undefined') {
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
