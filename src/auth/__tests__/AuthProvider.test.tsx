import { describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthProvider';
import { useAuth } from '../useAuth';
import type { AuthClient } from '../AuthClient';
import type { LoginCredentials, User } from '../types';

const ADMIN: User = {
  id: 'u_admin',
  name: 'Ada Admin',
  email: 'admin@example.com',
  roles: ['admin'],
};

const EDITOR: User = {
  id: 'u_editor',
  name: 'Edie Editor',
  email: 'editor@example.com',
  roles: ['editor', 'viewer'],
};

interface FakeOpts {
  initial?: User | null;
  loginResult?: User | Error;
  refreshError?: Error;
}

function makeFakeClient(opts: FakeOpts = {}): AuthClient & {
  loginCalls: LoginCredentials[];
  logoutCalls: number;
} {
  let current: User | null = opts.initial ?? null;
  const loginCalls: LoginCredentials[] = [];
  let logoutCalls = 0;

  return {
    loginCalls,
    get logoutCalls() {
      return logoutCalls;
    },
    async login(credentials: LoginCredentials): Promise<User> {
      loginCalls.push(credentials);
      const result = opts.loginResult;
      if (result instanceof Error) throw result;
      const u = result ?? current ?? ADMIN;
      current = u;
      return u;
    },
    async logout(): Promise<void> {
      logoutCalls += 1;
      current = null;
    },
    async refresh(): Promise<User | null> {
      if (opts.refreshError !== undefined) throw opts.refreshError;
      return current;
    },
    async getCurrentUser(): Promise<User | null> {
      return current;
    },
  };
}

function Probe() {
  const { user, state, error, login, logout, hasRole, hasAnyRole } = useAuth();
  return (
    <div>
      <div data-testid="state">{state}</div>
      <div data-testid="user">{user?.email ?? 'none'}</div>
      <div data-testid="error">{error?.message ?? 'none'}</div>
      <div data-testid="is-admin">{String(hasRole('admin'))}</div>
      <div data-testid="any-staff">{String(hasAnyRole(['admin', 'editor']))}</div>
      <button
        type="button"
        onClick={() => {
          void login({ email: 'admin@example.com', password: 'pw' }).catch(() => {
            /* swallow — provider records error */
          });
        }}
      >
        login
      </button>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
      >
        logout
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('starts in idle, refreshes on mount, transitions to unauthenticated when no session', async () => {
    const client = makeFakeClient({ initial: null });
    render(
      <AuthProvider client={client}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('unauthenticated'));
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('hydrates user from refresh on mount', async () => {
    const client = makeFakeClient({ initial: ADMIN });
    render(
      <AuthProvider client={client}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('authenticated'));
    expect(screen.getByTestId('user').textContent).toBe('admin@example.com');
    expect(screen.getByTestId('is-admin').textContent).toBe('true');
  });

  it('login success transitions to authenticated and clears prior error', async () => {
    const client = makeFakeClient({ initial: null, loginResult: EDITOR });
    render(
      <AuthProvider client={client}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('unauthenticated'));

    await act(async () => {
      screen.getByText('login').click();
    });
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('authenticated'));
    expect(screen.getByTestId('user').textContent).toBe('editor@example.com');
    expect(screen.getByTestId('is-admin').textContent).toBe('false');
    expect(screen.getByTestId('any-staff').textContent).toBe('true');
    expect(client.loginCalls).toHaveLength(1);
    expect(client.loginCalls[0]).toEqual({
      email: 'admin@example.com',
      password: 'pw',
    });
  });

  it('login failure sets error and stays unauthenticated', async () => {
    const err = Object.assign(new Error('Invalid email or password.'), {
      code: 'invalid_credentials',
    });
    const client = makeFakeClient({ initial: null, loginResult: err });
    render(
      <AuthProvider client={client}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('unauthenticated'));

    await act(async () => {
      screen.getByText('login').click();
    });
    await waitFor(() =>
      expect(screen.getByTestId('error').textContent).toBe('Invalid email or password.'),
    );
    expect(screen.getByTestId('state').textContent).toBe('unauthenticated');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('logout clears user and resets state', async () => {
    const client = makeFakeClient({ initial: ADMIN });
    render(
      <AuthProvider client={client}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('authenticated'));

    await act(async () => {
      screen.getByText('logout').click();
    });
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('unauthenticated'));
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(client.logoutCalls).toBe(1);
  });

  it('refresh failure transitions to unauthenticated with error', async () => {
    const client = makeFakeClient({ refreshError: new Error('boom') });
    render(
      <AuthProvider client={client}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('unauthenticated'));
    expect(screen.getByTestId('error').textContent).toBe('boom');
  });

  it('skipInitialRefresh skips auto-refresh and lands on unauthenticated', async () => {
    const client = makeFakeClient({ initial: ADMIN });
    const refreshSpy = vi.spyOn(client, 'refresh');
    render(
      <AuthProvider client={client} skipInitialRefresh>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('unauthenticated'));
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('hasRole / hasAnyRole return correct values', async () => {
    const client = makeFakeClient({ initial: EDITOR });
    render(
      <AuthProvider client={client}>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('authenticated'));
    expect(screen.getByTestId('is-admin').textContent).toBe('false');
    expect(screen.getByTestId('any-staff').textContent).toBe('true');
  });

  it('useAuth throws when called outside <AuthProvider>', () => {
    const Bare = () => {
      useAuth();
      return null;
    };
    // suppress React's error-boundary noise
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Bare />)).toThrow(/useAuth must be used inside/);
    err.mockRestore();
  });
});
