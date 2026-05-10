import { configureAxe } from 'vitest-axe';
import type { RunOptions } from 'axe-core';

/*
 * Project-wide axe runner for component tests.
 *
 * Two rules are disabled by default — see CONTRIBUTING.md ("A11y exceptions"):
 *
 *   color-contrast — jsdom cannot compute layout, so every element resolves to
 *     rgba(0,0,0,0) and the rule produces false positives. Contrast is covered
 *     by Storybook's @storybook/addon-a11y + manual review against the design
 *     tokens (which already meet WCAG AA).
 *
 *   region — landmark coverage is a page-level concern. Component tests render
 *     a single primitive in isolation, so requiring it to sit inside a
 *     <main>/<nav>/etc. is a structural false positive. The whole-app
 *     composition is verified by AppLayout / PageShell tests, where landmarks
 *     do exist.
 *
 * Tests can still pass `{ rules: { ... } }` to disable additional rules for a
 * specific assertion (legitimate cases are documented inline).
 */
const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
});

export function runAxe(container: Element | string, options?: RunOptions) {
  return axe(container, options);
}
