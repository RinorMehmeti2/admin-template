import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthProvider';
import { RoleGate } from '../RoleGate';
import type { AuthClient } from '../AuthClient';
import type { LoginCredentials, User } from '../types';

function userWith(roles: User['roles']): User {
  return { id: 'u', name: 'U', email: 'u@example.com', roles };
}

function fakeClient(initial: User | null): AuthClient {
  let current = initial;
  return {
    async login(_c: LoginCredentials) {
      return current ?? userWith([]);
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

function renderGate(initial: User | null, roles: string[]) {
  return render(
    <AuthProvider client={fakeClient(initial)}>
      <RoleGate roles={roles} fallback={<div>denied</div>}>
        <div>granted</div>
      </RoleGate>
    </AuthProvider>,
  );
}

describe('RoleGate', () => {
  it('renders children when user has the role', async () => {
    renderGate(userWith(['admin']), ['admin']);
    await waitFor(() => expect(screen.getByText('granted')).toBeInTheDocument());
  });

  it('renders children when user has any of the listed roles', async () => {
    renderGate(userWith(['editor']), ['admin', 'editor']);
    await waitFor(() => expect(screen.getByText('granted')).toBeInTheDocument());
  });

  it('renders fallback when user has none of the listed roles', async () => {
    renderGate(userWith(['viewer']), ['admin', 'editor']);
    await waitFor(() => expect(screen.getByText('denied')).toBeInTheDocument());
    expect(screen.queryByText('granted')).toBeNull();
  });

  it('renders fallback when no user is signed in', async () => {
    renderGate(null, ['admin']);
    // initial render shows nothing (default fallback === null) then 'denied'
    await waitFor(() => expect(screen.getByText('denied')).toBeInTheDocument());
  });

  it('default fallback is null (renders nothing)', async () => {
    render(
      <AuthProvider client={fakeClient(userWith(['viewer']))}>
        <RoleGate roles={['admin']}>
          <div>granted</div>
        </RoleGate>
      </AuthProvider>,
    );
    // Wait a tick for refresh to settle
    await waitFor(() => expect(screen.queryByText('granted')).toBeNull());
  });
});
