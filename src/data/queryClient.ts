import { QueryClient, type DefaultOptions } from '@tanstack/react-query';
import { ApiError } from './api';

/*
 * QueryClient defaults for the admin template.
 *
 *   - staleTime: 30s. Most admin reads tolerate brief staleness; this caps
 *     refetch chatter when the same key is mounted in multiple places.
 *   - gcTime: 5min. Inactive caches survive a tab switch but don't grow
 *     unbounded.
 *   - retry: 1 — exactly one retry on network/5xx. Never retry on auth errors
 *     (api.ts already handles 401 once internally; further retries would
 *     thrash logout).
 *   - refetchOnWindowFocus: production only. Dev focus-flicker is annoying.
 */

export const DEFAULT_QUERY_OPTIONS: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: import.meta.env.PROD,
    retry: (failureCount, error) => {
      if (error instanceof ApiError) {
        // Don't retry client errors (4xx) — they won't fix themselves.
        if (error.status >= 400 && error.status < 500) return false;
      }
      return failureCount < 1;
    },
  },
  mutations: {
    retry: false,
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: DEFAULT_QUERY_OPTIONS });
}

/** Default singleton — fine for the app. Tests should call createQueryClient() per case. */
export const queryClient: QueryClient = createQueryClient();
