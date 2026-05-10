/*
 * Type augmentation for vitest-axe under Vitest 4.
 *
 * vitest-axe ships an `extend-expect.d.ts` that declares the matcher under
 * the legacy `Vi.Assertion` namespace, but Vitest 4 reorganised its types so
 * that `Assertion` is exported from `vitest` (and `@vitest/expect`) directly.
 * This file bridges the two so `expect(result).toHaveNoViolations()` is
 * type-checked at the call site.
 */
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

export {};
