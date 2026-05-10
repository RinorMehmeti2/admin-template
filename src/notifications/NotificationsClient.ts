import type {
  Notification,
  NotificationsListParams,
  NotificationsPage,
  Unsubscribe,
} from './types';

/*
 * Implementation-agnostic notifications backend. NotificationsProvider depends
 * only on this surface — swap to a real backend (REST + SSE/WebSocket) by
 * writing a single object that satisfies NotificationsClient and passing it
 * to <NotificationsProvider client={...}>.
 *
 * Contract:
 *   - list: cursor-paginated. Server applies `unreadOnly` filter; the provider
 *     does NOT re-filter on top. `nextCursor` is `null` when exhausted.
 *   - markRead: idempotent over an array of ids. Resolve even if some ids are
 *     unknown (no error for stale ids).
 *   - markAllRead: marks every notification across pages as read.
 *   - remove: idempotent. Resolves whether or not the id existed.
 *   - subscribe: pushes new notifications as they arrive. Returns an
 *     Unsubscribe handle. Implementations can multiplex internally; calling
 *     subscribe twice should yield two independent unsubscribes.
 */
export interface NotificationsClient {
  list(params?: NotificationsListParams): Promise<NotificationsPage>;
  markRead(ids: string[]): Promise<void>;
  markAllRead(): Promise<void>;
  remove(id: string): Promise<void>;
  subscribe(onNew: (n: Notification) => void): Unsubscribe;
}
