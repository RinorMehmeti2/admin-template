import { useEffect } from 'react';
import { mockAuthClient } from '@/auth';
import type { AuthClient } from '@/auth';
import { useAuth } from '@/auth';
import { configureApi } from './api';

/*
 * Wires the data layer's `api()` helper to the live auth session.
 *
 * Mount this once inside <AuthProvider> (above any component that calls
 * useApiQuery / useApiMutation). The effect reconfigures the singleton client
 * with:
 *
 *   - getToken: pulls a bearer token off `user.token` if your User type carries
 *     one. The shipped mock User has no token, so this returns null and no
 *     `Authorization` header is sent — fine for same-origin demos.
 *   - refresh: delegates to the AuthClient passed via prop (default:
 *     mockAuthClient).
 *   - onAuthFailure: logs out so the UI flips to the login route.
 *
 * Real backends: replace `client` with the same instance you handed to
 * <AuthProvider>, and extend the User type to carry whatever bearer your API
 * expects (or set httpOnly cookies and leave getToken returning null).
 */

export interface ApiAuthBridgeProps {
  /** AuthClient used to refresh on 401. Defaults to the in-memory mock. */
  client?: AuthClient;
  /** Override base URL. Defaults to import.meta.env.VITE_API_URL ?? ''. */
  baseUrl?: string;
}

interface UserWithToken {
  token?: string;
}

export function ApiAuthBridge({ client = mockAuthClient, baseUrl }: ApiAuthBridgeProps) {
  const { user, logout } = useAuth();

  useEffect(() => {
    const resolvedBase =
      baseUrl ??
      (typeof import.meta.env.VITE_API_URL === 'string' ? import.meta.env.VITE_API_URL : '');
    configureApi({
      baseUrl: resolvedBase,
      getToken: () => {
        const token = (user as (typeof user & UserWithToken) | null)?.token;
        return typeof token === 'string' ? token : null;
      },
      refresh: () => client.refresh(),
      onAuthFailure: () => {
        void logout();
      },
    });
  }, [user, client, baseUrl, logout]);

  return null;
}
