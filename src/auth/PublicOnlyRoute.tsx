import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/primitives/Skeleton';
import { useAuth } from './useAuth';

/*
 * Inverse of ProtectedRoute: pages like /login that should not be reachable
 * when already signed in. Honors a `from` location passed via Navigate state
 * so a redirected-then-logged-in user lands back where they started.
 */

export interface PublicOnlyRouteProps {
  children: ReactNode;
  /** Where to send authenticated users. Default `/`. */
  redirectTo?: string;
  fallback?: ReactNode;
}

interface FromState {
  from?: string;
}

export function PublicOnlyRoute({ children, redirectTo = '/', fallback }: PublicOnlyRouteProps) {
  const { state } = useAuth();
  const location = useLocation();
  const from = (location.state as FromState | null)?.from;

  if (state === 'idle' || state === 'authenticating') {
    return (
      <>
        {fallback ?? (
          <div className="space-y-3 p-8" role="status" aria-label="Loading">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
      </>
    );
  }
  if (state === 'authenticated') {
    return <Navigate to={from ?? redirectTo} replace />;
  }
  return <>{children}</>;
}
