import type { AuthClient } from './AuthClient';
import type { AuthError, LoginCredentials, User } from './types';

/*
 * In-memory auth client backed by localStorage so a "session" survives a
 * page reload during demos. Hardcoded users + passwords. NOT for production.
 *
 * Replace with a real implementation by writing your own object satisfying
 * AuthClient and passing it as <AuthProvider client={...}>.
 */

const STORAGE_KEY = 'admin-template-auth-user';

interface MockAccount {
  user: User;
  password: string;
}

const ACCOUNTS: ReadonlyArray<MockAccount> = [
  {
    password: 'admin',
    user: {
      id: 'u_1',
      name: 'Ada Admin',
      email: 'admin@example.com',
      roles: ['admin'],
    },
  },
  {
    password: 'editor',
    user: {
      id: 'u_2',
      name: 'Edie Editor',
      email: 'editor@example.com',
      roles: ['editor'],
    },
  },
  {
    password: 'viewer',
    user: {
      id: 'u_3',
      name: 'Vic Viewer',
      email: 'viewer@example.com',
      roles: ['viewer'],
    },
  },
];

function readStored(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as User;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore storage failures
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function makeError(code: AuthError['code'], message: string): AuthError {
  return { code, message };
}

export interface MockAuthClientOptions {
  /** Simulated network latency in ms. Default 250. */
  latencyMs?: number;
}

export function createMockAuthClient(opts: MockAuthClientOptions = {}): AuthClient {
  const latency = opts.latencyMs ?? 250;

  return {
    async login(credentials: LoginCredentials): Promise<User> {
      await delay(latency);
      const match = ACCOUNTS.find(
        (a) =>
          a.user.email.toLowerCase() === credentials.email.toLowerCase() &&
          a.password === credentials.password,
      );
      if (match === undefined) {
        throw makeError('invalid_credentials', 'Invalid email or password.');
      }
      writeStored(match.user);
      return match.user;
    },
    async logout(): Promise<void> {
      await delay(latency);
      writeStored(null);
    },
    async refresh(): Promise<User | null> {
      await delay(latency);
      return readStored();
    },
    async getCurrentUser(): Promise<User | null> {
      return readStored();
    },
  };
}

/** Default singleton — fine for demos; for tests use createMockAuthClient(). */
export const mockAuthClient: AuthClient = createMockAuthClient();

/** Exported so login UI can render demo credentials in dev. */
export const MOCK_ACCOUNTS: ReadonlyArray<{
  email: string;
  password: string;
  roles: User['roles'];
}> = ACCOUNTS.map((a) => ({
  email: a.user.email,
  password: a.password,
  roles: a.user.roles,
}));
