import { useRef, type ReactNode } from 'react';
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

  // Once children have been shown, keep showing them through later
  // 'authenticating' transitions (e.g., a user submitting the login form).
  // Otherwise the form unmounts during in-flight login and remounts empty
  // with no error visible after a failed attempt. Reading + writing this
  // ref during render is intentional — the alternative (useState + effect)
  // costs an extra render with no observable benefit; documented carve-out
  // per CONTRIBUTING.md "Lint pragmatism".
  const hasShownChildren = useRef(false);

  if (state === 'authenticated') {
    return <Navigate to={from ?? redirectTo} replace />;
  }
  // eslint-disable-next-line react-hooks/refs
  if (state === 'unauthenticated' || hasShownChildren.current) {
    // eslint-disable-next-line react-hooks/refs
    hasShownChildren.current = true;
    return <>{children}</>;
  }
  // Initial 'idle' or first 'authenticating' (auto-refresh on mount).
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
