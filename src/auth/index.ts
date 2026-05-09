export type { AuthClient } from './AuthClient';
export {
  createMockAuthClient,
  mockAuthClient,
  MOCK_ACCOUNTS,
  type MockAuthClientOptions,
} from './mockAuthClient';
export { AuthProvider, type AuthProviderProps } from './AuthProvider';
export { useAuth, type AuthContextValue } from './useAuth';
export { ProtectedRoute, type ProtectedRouteProps } from './ProtectedRoute';
export { PublicOnlyRoute, type PublicOnlyRouteProps } from './PublicOnlyRoute';
export { RoleGate, type RoleGateProps } from './RoleGate';
export {
  isAuthError,
  type AuthError,
  type AuthErrorCode,
  type AuthState,
  type LoginCredentials,
  type Role,
  type User,
} from './types';
