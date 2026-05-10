/*
 * Query key factory.
 *
 * Centralizing keys here gives us three things:
 *
 *   1. **One canonical shape per resource.** `users.list({ page, search })`
 *      always produces `['users', 'list', { page, search }]` so cache lookups
 *      match across the app.
 *   2. **Hierarchical invalidation.** Every key starts with the resource
 *      root (`users.all`). `queryClient.invalidateQueries({ queryKey: users.all })`
 *      blows the whole resource; `users.lists()` blows just lists; specific
 *      keys can be invalidated by their full shape.
 *   3. **Type safety for params.** Each builder is typed — passing the wrong
 *      params is a compile error.
 *
 * Pattern for a new resource:
 *
 * ```ts
 * export const orders = {
 *   all: ['orders'] as const,
 *   lists: () => [...orders.all, 'list'] as const,
 *   list: (filters: OrderListFilters) => [...orders.lists(), filters] as const,
 *   details: () => [...orders.all, 'detail'] as const,
 *   detail: (id: string) => [...orders.details(), id] as const,
 * };
 * ```
 */

export interface UserListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const users = {
  all: ['users'] as const,
  lists: () => [...users.all, 'list'] as const,
  list: (filters: UserListFilters = {}) => [...users.lists(), filters] as const,
  details: () => [...users.all, 'detail'] as const,
  detail: (id: string) => [...users.details(), id] as const,
};

/** Helper to type-narrow a queryKey origin in invalidation callsites. */
export type QueryKey = ReadonlyArray<unknown>;
