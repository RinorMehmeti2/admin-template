import type { LoginCredentials, User } from './types';

/*
 * Implementation-agnostic auth backend. AuthProvider depends only on this
 * surface — swap to a real backend by writing a single class/object that
 * satisfies AuthClient and passing it as the `client` prop.
 *
 * Contract:
 *   - login: resolves with the signed-in User on success; rejects with an
 *     AuthError on failure.
 *   - logout: always resolves; clears any persisted session.
 *   - refresh: resolves with the User if a valid session exists, or `null`
 *     when there is no session. Should not throw for "no session"; reserve
 *     rejection for transport/server failure.
 *   - getCurrentUser: synchronous-feeling read of the cached user. Returns
 *     `null` when unauthenticated. Implementations may still hit storage.
 */
export interface AuthClient {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  refresh(): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
}
