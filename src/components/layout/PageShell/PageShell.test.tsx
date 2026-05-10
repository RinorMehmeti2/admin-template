import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageShell } from './PageShell';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { runAxe } from '@/test-utils/a11y';

describe('PageShell', () => {
  it('renders sidebar, topbar, and main content', () => {
    render(
      <MemoryRouter>
        <PageShell
          sidebar={<Sidebar><nav data-testid="nav" /></Sidebar>}
          topbar={<Topbar left={<span data-testid="brand">Brand</span>} />}
        >
          <div data-testid="page">page content</div>
        </PageShell>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('nav')).toBeInTheDocument();
    expect(screen.getByTestId('brand')).toBeInTheDocument();
    expect(screen.getByTestId('page')).toBeInTheDocument();
  });

  it('has no a11y violations (composed shell)', async () => {
    const { container } = render(
      <MemoryRouter>
        <PageShell
          sidebar={<Sidebar><nav aria-label="Sidebar"><a href="/">Home</a></nav></Sidebar>}
          topbar={<Topbar left={<span>Brand</span>} />}
        >
          <p>page content</p>
        </PageShell>
      </MemoryRouter>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
