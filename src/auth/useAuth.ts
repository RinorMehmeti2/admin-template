import { createContext, useContext } from 'react';
import type { AuthError, AuthState, LoginCredentials, Role, User } from './types';

/*
 * Auth context + consumer hook. Kept in a non-component file so React Fast
 * Refresh can hot-reload <AuthProvider> without invalidating consumers.
 */

export interface AuthContextValue {
  user: User | null;
  state: AuthState;
  error: AuthError | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
