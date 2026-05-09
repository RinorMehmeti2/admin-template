import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../AuthProvider';
import { PublicOnlyRoute } from '../PublicOnlyRoute';
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

function harness(client: AuthClient, redirectTo?: string) {
  return render(
    <AuthProvider client={client}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute {...(redirectTo !== undefined ? { redirectTo } : {})}>
                <div>login form</div>
              </PublicOnlyRoute>
            }
          />
          <Route path="/" element={<div>home</div>} />
          <Route path="/dash" element={<div>dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('PublicOnlyRoute', () => {
  it('renders children when unauthenticated', async () => {
    harness(fakeClient(null));
    await waitFor(() => expect(screen.getByText('login form')).toBeInTheDocument());
  });

  it('redirects authenticated users to /', async () => {
    harness(fakeClient(USER));
    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument());
    expect(screen.queryByText('login form')).toBeNull();
  });

  it('honors custom redirectTo', async () => {
    harness(fakeClient(USER), '/dash');
    await waitFor(() => expect(screen.getByText('dashboard')).toBeInTheDocument());
  });
});
