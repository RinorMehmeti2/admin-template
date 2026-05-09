import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../AuthProvider';
import { ProtectedRoute } from '../ProtectedRoute';
import type { AuthClient } from '../AuthClient';
import type { LoginCredentials, User } from '../types';

const USER: User = {
  id: 'u',
  name: 'X',
  email: 'x@example.com',
  roles: ['admin'],
};

function fakeClient(initial: User | null): AuthClient {
  let current = initial;
  return {
    async login(_c: LoginCredentials) {
      current = USER;
      return USER;
    },
    async logout() {
      current = null;
    },
    async refresh() {
      return current;
    },
    async getCurrentUser() {
      return current;
    },
  };
}

function renderAt(path: string, client: AuthClient) {
  return render(
    <AuthProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/secret"
            element={
              <ProtectedRoute>
                <div>secret content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('renders fallback skeleton while auth is resolving', () => {
    renderAt('/secret', fakeClient(null));
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('secret content')).toBeNull();
  });

  it('redirects unauthenticated users to /login', async () => {
    renderAt('/secret', fakeClient(null));
    await waitFor(() => expect(screen.getByText('login page')).toBeInTheDocument());
    expect(screen.queryByText('secret content')).toBeNull();
  });

  it('renders children when authenticated', async () => {
    renderAt('/secret', fakeClient(USER));
    await waitFor(() => expect(screen.getByText('secret content')).toBeInTheDocument());
  });

  it('honors custom redirectTo', async () => {
    const client = fakeClient(null);
    render(
      <AuthProvider client={client}>
        <MemoryRouter initialEntries={['/secret']}>
          <Routes>
            <Route
              path="/secret"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <div>secret</div>
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<div>custom auth</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('custom auth')).toBeInTheDocument());
  });
});
