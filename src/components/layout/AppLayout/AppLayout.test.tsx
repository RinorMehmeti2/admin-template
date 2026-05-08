import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';

function renderWithRouter(initialPath = '/primitives') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="primitives" element={<div>primitives content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppLayout', () => {
  it('renders nav with the Primitives link', () => {
    renderWithRouter();
    const link = screen.getByRole('link', { name: 'Primitives' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/primitives');
  });

  it('renders the matched route content via <Outlet />', () => {
    renderWithRouter();
    expect(screen.getByText('primitives content')).toBeInTheDocument();
  });

  it('exposes a theme toggle button', () => {
    renderWithRouter();
    // initial label depends on stored/preferred theme; just assert one exists
    const toggle = screen.getByRole('button', { name: /switch to (light|dark) mode/i });
    expect(toggle).toBeInTheDocument();
  });
});
