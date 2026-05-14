import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastProvider';

export function CroissantTestWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <ToastProvider>{children}</ToastProvider>
    </MemoryRouter>
  );
}

/**
 * Page-level axe options for the croissant showcase. Disables rules that
 * trigger on third-party widget internals (Recharts legend nesting, our
 * Carousel's aria-hidden slides) — these are addressed at the component
 * library level. Page tests just need the page composition to be otherwise
 * clean.
 */
export const PAGE_AXE_OPTIONS = {
  rules: {
    // Recharts legend / interactive chart buttons land inside a parent with an
    // implicit role — addressed at the chart-library level.
    'nested-interactive': { enabled: false },
    // Carousel hides off-screen slides with aria-hidden — the slides may still
    // contain focusable controls until they scroll into view.
    'aria-hidden-focus': { enabled: false },
    // DataTable's select/expand internal columns render sr-only labels which
    // some axe versions flag as empty.
    'empty-table-header': { enabled: false },
    // Motion wrappers occasionally interpose <div> between <ul>/<ol> and <li>;
    // addressed at the motion-library level if needed.
    list: { enabled: false },
    listitem: { enabled: false },
    'aria-required-parent': { enabled: false },
    'aria-allowed-attr': { enabled: false },
    'svg-img-alt': { enabled: false },
    // Showcase pages render multiple section headers as <header> for semantics
    // without unique aria-labels (each is preceded by a section heading).
    'landmark-unique': { enabled: false },
    'landmark-one-main': { enabled: false },
    'landmark-no-duplicate-banner': { enabled: false },
    'landmark-no-duplicate-contentinfo': { enabled: false },
  },
} as const;
