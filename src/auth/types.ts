/*
 * Auth domain types. Role is a string-literal union that consumers can extend
 * by re-declaring the type in their own project: this default ships common
 * roles ('admin' | 'editor' | 'viewer') but the trailing `(string & {})` keeps
 * any string assignable, so swapping in a custom set is purely a type-level
 * change with no runtime impact.
 */

// Use `(string & {})` to keep IntelliSense for the common roles while still
// accepting arbitrary strings — consumers can either use these roles directly,
// pass any string literal of their own, or redeclare `Role` in a `.d.ts`
// override file.
export type Role = 'admin' | 'editor' | 'viewer' | (string & {});

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  avatarUrl?: string;
}

export type AuthState =
  | 'idle'
  | 'authenticating'
  | 'authenticated'
  | 'unauthenticated';

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'network'
  | 'session_expired'
  | 'unknown';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export function isAuthError(value: unknown): value is AuthError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value
  );
}
