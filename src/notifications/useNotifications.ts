import { createContext, useContext } from 'react';
import type { Notification, NotificationsFilter } from './types';

/*
 * Notifications context + consumer hook. Kept in a non-component file so
 * React Fast Refresh can hot-reload <NotificationsProvider> without
 * invalidating consumers.
 */

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  filter: NotificationsFilter;
  setFilter: (filter: NotificationsFilter) => void;
  fetchMore: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Force a fresh first-page fetch (e.g., after filter change). */
  refresh: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (ctx === null) {
    throw new Error('useNotifications must be used inside <NotificationsProvider>');
  }
  return ctx;
}
