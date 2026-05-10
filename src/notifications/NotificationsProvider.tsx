import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { NotificationsClient } from './NotificationsClient';
import { mockNotificationsClient } from './mockNotificationsClient';
import { NotificationsContext, type NotificationsContextValue } from './useNotifications';
import type { Notification, NotificationsFilter } from './types';

/*
 * Owns the in-app notifications cache. Lifecycle:
 *
 *   on mount  → list({ unreadOnly: filter==='unread' }) + subscribe()
 *   on filter → re-list from page 1
 *   on new    → subscribe callback prepends if it passes the current filter
 *   on action → optimistic local update, rollback on error
 *
 * We deliberately don't reach for react-query: the subscribe channel is
 * push-based and the dataset is small. If polling joins later, swap to
 * `useApiQuery` + `setQueryData` from the subscribe callback.
 */

export interface NotificationsProviderProps {
  children: ReactNode;
  /** Defaults to the in-memory mockNotificationsClient. */
  client?: NotificationsClient;
  /** Page size passed to client.list(). Default 10. */
  pageSize?: number;
  /** Skip the auto first-page fetch on mount (tests). Default false. */
  skipInitialFetch?: boolean;
}

function dedupePrepend(items: Notification[], next: Notification): Notification[] {
  if (items.some((n) => n.id === next.id)) return items;
  return [next, ...items];
}

function countUnread(items: Notification[]): number {
  let n = 0;
  for (const item of items) if (!item.read) n++;
  return n;
}

export function NotificationsProvider({
  children,
  client = mockNotificationsClient,
  pageSize = 10,
  skipInitialFetch = false,
}: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilterState] = useState<NotificationsFilter>('all');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch);

  // Latest client kept in a ref so callbacks stay stable across swaps.
  const clientRef = useRef(client);
  useEffect(() => {
    clientRef.current = client;
  });

  const loadFirstPage = useCallback(
    async (nextFilter: NotificationsFilter) => {
      setIsLoading(true);
      try {
        const page = await clientRef.current.list({
          ...(nextFilter === 'unread' ? { unreadOnly: true } : {}),
          limit: pageSize,
        });
        setNotifications(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.nextCursor !== null);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize],
  );

  // Initial load.
  useEffect(() => {
    if (skipInitialFetch) return;
    let cancelled = false;
    void (async () => {
      try {
        const page = await clientRef.current.list({ limit: pageSize });
        if (cancelled) return;
        setNotifications(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.nextCursor !== null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageSize, skipInitialFetch]);

  // Subscribe to live pushes.
  useEffect(() => {
    const unsubscribe = clientRef.current.subscribe((fresh) => {
      setNotifications((current) => {
        // Honor the current filter — drop a read item arriving in unread view
        // (shouldn't happen for fresh subscribe events, but be defensive).
        if (filter === 'unread' && fresh.read) return current;
        return dedupePrepend(current, fresh);
      });
    });
    return () => unsubscribe();
  }, [filter]);

  const setFilter = useCallback(
    (next: NotificationsFilter) => {
      if (next === filter) return;
      setFilterState(next);
      void loadFirstPage(next);
    },
    [filter, loadFirstPage],
  );

  const fetchMore = useCallback(async () => {
    if (!hasMore || isLoading || cursor === null) return;
    setIsLoading(true);
    try {
      const page = await clientRef.current.list({
        cursor,
        ...(filter === 'unread' ? { unreadOnly: true } : {}),
        limit: pageSize,
      });
      setNotifications((current) => {
        const seen = new Set(current.map((n) => n.id));
        const additions = page.items.filter((n) => !seen.has(n.id));
        return [...current, ...additions];
      });
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, cursor, filter, pageSize]);

  const markRead = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      const idSet = new Set(ids);
      const previous = notifications;
      // Optimistic update.
      setNotifications((current) =>
        current.map((n) => (idSet.has(n.id) && !n.read ? { ...n, read: true } : n)),
      );
      try {
        await clientRef.current.markRead(ids);
      } catch (err) {
        setNotifications(previous);
        throw err;
      }
    },
    [notifications],
  );

  const markAllRead = useCallback(async () => {
    const previous = notifications;
    setNotifications((current) => current.map((n) => (n.read ? n : { ...n, read: true })));
    try {
      await clientRef.current.markAllRead();
    } catch (err) {
      setNotifications(previous);
      throw err;
    }
  }, [notifications]);

  const remove = useCallback(
    async (id: string) => {
      const previous = notifications;
      setNotifications((current) => current.filter((n) => n.id !== id));
      try {
        await clientRef.current.remove(id);
      } catch (err) {
        setNotifications(previous);
        throw err;
      }
    },
    [notifications],
  );

  const refresh = useCallback(() => loadFirstPage(filter), [filter, loadFirstPage]);

  const unreadCount = useMemo(() => countUnread(notifications), [notifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      hasMore,
      filter,
      setFilter,
      fetchMore,
      markRead,
      markAllRead,
      remove,
      refresh,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      hasMore,
      filter,
      setFilter,
      fetchMore,
      markRead,
      markAllRead,
      remove,
      refresh,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
