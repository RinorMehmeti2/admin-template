import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';

/*
 * Convenience hook for invalidating queries by key prefix. Example:
 *
 *   const invalidate = useInvalidate();
 *   await invalidate(users.lists());          // every users-list cache
 *   await invalidate(users.detail('u_42'));   // one specific detail
 *   await invalidate(users.all);              // every users-rooted query
 *
 * Calls `queryClient.invalidateQueries` with `exact: false` so any key that
 * starts with the given prefix is invalidated.
 */

export function useInvalidate(): (key: QueryKey) => Promise<void> {
  const client = useQueryClient();
  return useCallback(
    (key: QueryKey) => client.invalidateQueries({ queryKey: key, exact: false }),
    [client],
  );
}
