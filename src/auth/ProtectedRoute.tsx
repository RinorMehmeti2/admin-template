import type { ReactElement, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/primitives/Skeleton';
import { useAuth } from './useAuth';

/*
 * Guards children behind authentication. While the auth state is still
 * resolving (idle | authenticating) it renders a Skeleton placeholder so
 * the UI doesn't flash to the login page on a hard refresh of an already
 * signed-in user.
 *
 * On unauthenticated, it redirects to `redirectTo` (default `/login`) and
 * stashes the current location in router state so the login page can send
 * the user back after a successful sign-in.
 */

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Where to send unauthenticated users. Default `/login`. */
  redirectTo?: string;
  /** Override the loading placeholder. */
  fallback?: ReactNode;
}

function DefaultLoading(): ReactElement {
  return (
    <div className="space-y-3 p-8" role="status" aria-label="Loading">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function ProtectedRoute({ children, redirectTo = '/login', fallback }: ProtectedRouteProps) {
  const { state } = useAuth();
  const location = useLocation();

  if (state === 'idle' || state === 'authenticating') {
    return <>{fallback ?? <DefaultLoading />}</>;
  }
  if (state === 'unauthenticated') {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }
  return <>{children}</>;
}
