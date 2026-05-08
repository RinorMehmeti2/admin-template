import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ThemeProvider } from '@/context/ThemeProvider';
import { CommandRegistryProvider } from '@/components/overlays/CommandPalette';

function renderWithRouter(initialPath = '/primitives') {
  return render(
    <ThemeProvider>
      <CommandRegistryProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route path="primitives" element={<div>primitives content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CommandRegistryProvider>
    </ThemeProvider>,
  );
}

describe('AppLayout', () => {
  it('renders nav with the Primitives link', () => {
    renderWithRouter();
    const link = screen.getByRole('link', { name: /Primitives/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/primitives');
  });

  it('renders the matched route content via <Outlet />', () => {
    renderWithRouter();
    expect(screen.getByText('primitives content')).toBeInTheDocument();
  });

  it('exposes a theme toggle button', () => {
    renderWithRouter();
    const toggle = screen.getByRole('button', { name: /^Theme:/i });
    expect(toggle).toBeInTheDocument();
  });

  it('exposes the command palette opener with ⌘K hint', () => {
    renderWithRouter();
    expect(screen.getByRole('button', { name: /Open command palette/i })).toBeInTheDocument();
  });
});
