import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ThemeProvider } from '@/context/ThemeProvider';
import { LocaleProvider } from '@/context/LocaleProvider';
import { CommandRegistryProvider } from '@/components/overlays/CommandPalette';
import { AuthProvider } from '@/auth';
import { NotificationsProvider } from '@/notifications';
import { createMockNotificationsClient } from '@/notifications/mockNotificationsClient';
import { runAxe } from '@/test-utils/a11y';

function renderWithRouter(initialPath = '/primitives') {
  const notificationsClient = createMockNotificationsClient({
    persist: false,
    latencyMs: 0,
    emitEveryMs: null,
    initialItems: [],
  });
  return render(
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider skipInitialRefresh>
          <NotificationsProvider client={notificationsClient}>
            <CommandRegistryProvider>
              <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                  <Route path="/" element={<AppLayout />}>
                    <Route path="primitives" element={<div>primitives content</div>} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </CommandRegistryProvider>
          </NotificationsProvider>
        </AuthProvider>
      </LocaleProvider>
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

  it('has no a11y violations (composed layout)', async () => {
    const { container } = renderWithRouter();
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
