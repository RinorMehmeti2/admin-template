import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { ApiError } from './api';

/*
 * Typed wrapper around useQuery. The error channel is fixed to ApiError so
 * consumers don't have to widen TError everywhere. The fetcher is a plain
 * async function — typically built on top of `api()` from ./api.
 */

export type ApiQueryOptions<TData, TKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<TData, ApiError, TData, TKey>,
  'queryKey' | 'queryFn'
>;

export function useApiQuery<TData, TKey extends QueryKey = QueryKey>(
  queryKey: TKey,
  fetcher: () => Promise<TData>,
  options?: ApiQueryOptions<TData, TKey>,
): UseQueryResult<TData, ApiError> {
  return useQuery<TData, ApiError, TData, TKey>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}
