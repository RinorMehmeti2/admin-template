import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import type { Role } from './types';

/*
 * Conditionally renders children when the current user has any of the
 * listed roles. Use to gate UI within an already-authenticated page. For
 * route-level role enforcement, compose <RoleGate> inside <ProtectedRoute>.
 */

export interface RoleGateProps {
  roles: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({ roles, fallback = null, children }: RoleGateProps) {
  const { hasAnyRole } = useAuth();
  if (!hasAnyRole(roles)) return <>{fallback}</>;
  return <>{children}</>;
}
