import {
  useSuspenseQuery,
  type QueryKey,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';
import type { ApiError } from './api';

/*
 * Suspense-mode counterpart to useApiQuery. Pairs with <LoadingBoundary>:
 * the query throws a Promise while loading (caught by the nearest <Suspense>)
 * and throws ApiError on failure (caught by the surrounding <ErrorBoundary>).
 *
 * Use this when the surrounding route or section can render its loading and
 * error states declaratively. Stick with useApiQuery when the consumer wants
 * inline loading/error rendering or `keepPreviousData`-style transitions.
 */

export type ApiSuspenseQueryOptions<TData, TKey extends QueryKey = QueryKey> = Omit<
  UseSuspenseQueryOptions<TData, ApiError, TData, TKey>,
  'queryKey' | 'queryFn'
>;

export function useApiSuspenseQuery<TData, TKey extends QueryKey = QueryKey>(
  queryKey: TKey,
  fetcher: () => Promise<TData>,
  options?: ApiSuspenseQueryOptions<TData, TKey>,
): UseSuspenseQueryResult<TData, ApiError> {
  return useSuspenseQuery<TData, ApiError, TData, TKey>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}
