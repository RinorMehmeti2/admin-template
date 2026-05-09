import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthClient } from './AuthClient';
import { mockAuthClient } from './mockAuthClient';
import { AuthContext, type AuthContextValue } from './useAuth';
import {
  isAuthError,
  type AuthError,
  type AuthState,
  type LoginCredentials,
  type Role,
  type User,
} from './types';

/*
 * AuthProvider holds session state. It depends on an `AuthClient` interface
 * and defaults to the in-memory mockAuthClient — pass a real implementation
 * via the `client` prop to talk to a backend.
 *
 * State machine:
 *   idle              → on mount, before auto-refresh runs
 *   authenticating    → during login() or refresh()
 *   authenticated     → user is set
 *   unauthenticated   → no session (after logout, refresh-with-no-session,
 *                       or failed login)
 */

export interface AuthProviderProps {
  children: ReactNode;
  /** Defaults to the in-memory mockAuthClient — swap for a real backend. */
  client?: AuthClient;
  /** Disable automatic refresh-on-mount. Default false. */
  skipInitialRefresh?: boolean;
}

function normalizeError(err: unknown): AuthError {
  if (isAuthError(err)) return err;
  if (err instanceof Error) return { code: 'unknown', message: err.message };
  return { code: 'unknown', message: 'Authentication failed.' };
}

export function AuthProvider({
  children,
  client = mockAuthClient,
  skipInitialRefresh = false,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // Initial state derived from props so the auto-refresh effect doesn't need
  // a synchronous setState (which the react-hooks lint plugin flags).
  const [state, setState] = useState<AuthState>(
    skipInitialRefresh ? 'unauthenticated' : 'authenticating',
  );
  const [error, setError] = useState<AuthError | null>(null);

  // Keep the latest client in a ref so login/logout callbacks remain stable
  // while still honoring a swapped `client` prop. Mutation lives in an effect
  // to satisfy react-hooks/refs (no mutation during render).
  const clientRef = useRef(client);
  /* eslint-disable react-hooks/refs */
  useEffect(() => {
    clientRef.current = client;
  });
  /* eslint-enable react-hooks/refs */

  // Auto-refresh on mount.
  useEffect(() => {
    if (skipInitialRefresh) return;
    let cancelled = false;
    clientRef.current
      .refresh()
      .then((u) => {
        if (cancelled) return;
        if (u !== null) {
          setUser(u);
          setState('authenticated');
        } else {
          setUser(null);
          setState('unauthenticated');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(normalizeError(err));
        setUser(null);
        setState('unauthenticated');
      });
    return () => {
      cancelled = true;
    };
  }, [skipInitialRefresh]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setState('authenticating');
    setError(null);
    try {
      const u = await clientRef.current.login(credentials);
      setUser(u);
      setState('authenticated');
      return u;
    } catch (err) {
      const authErr = normalizeError(err);
      setError(authErr);
      setUser(null);
      setState('unauthenticated');
      throw authErr;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await clientRef.current.logout();
    } finally {
      setUser(null);
      setState('unauthenticated');
      setError(null);
    }
  }, []);

  const hasRole = useCallback(
    (role: Role): boolean => user !== null && user.roles.includes(role),
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: Role[]): boolean =>
      user !== null && roles.some((r) => user.roles.includes(r)),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, state, error, login, logout, hasRole, hasAnyRole }),
    [user, state, error, login, logout, hasRole, hasAnyRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
