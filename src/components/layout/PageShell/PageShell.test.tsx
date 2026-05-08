import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageShell } from './PageShell';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

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
});
