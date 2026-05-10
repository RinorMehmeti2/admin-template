import {
  MutationCache,
  QueryCache,
  QueryClient,
  type DefaultOptions,
  type Mutation,
} from '@tanstack/react-query';
import { ApiError } from './api';
import { dispatchError } from './errorHandler';

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
 *
 * Global error handling lives on QueryCache + MutationCache here (per
 * TanStack Query v5 — query-level onError on defaultOptions is gone). Both
 * caches forward to dispatchError(), which classifies via mapApiError() and
 * fires the toast / redirect side effect through the registered dispatcher.
 *
 * Components opt out of global dispatch by setting
 *   meta: { handlesErrors: true }
 * on the query / mutation. useApiFormSubmit relies on this to fully own
 * inline error handling.
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

interface ErrorMeta {
  handlesErrors?: boolean;
}

function shouldDispatch(meta: Record<string, unknown> | undefined): boolean {
  return (meta as ErrorMeta | undefined)?.handlesErrors !== true;
}

export function createQueryClient(): QueryClient {
  const queryCache = new QueryCache({
    onError: (error, query) => {
      if (shouldDispatch(query.meta)) dispatchError(error);
    },
  });
  const mutationCache = new MutationCache({
    onError: (error, _vars, _ctx, mutation: Mutation<unknown, unknown, unknown, unknown>) => {
      if (shouldDispatch(mutation.meta)) dispatchError(error);
    },
  });
  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: DEFAULT_QUERY_OPTIONS,
  });
}

/** Default singleton — fine for the app. Tests should call createQueryClient() per case. */
export const queryClient: QueryClient = createQueryClient();
