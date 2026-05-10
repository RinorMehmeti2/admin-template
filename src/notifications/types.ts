/*
 * Persistent notifications inbox — different from <Toast>.
 *
 * Toast = transient feedback for the action you just took.
 * Notification = a record persisted server-side, surfaced in a Topbar bell
 * with an unread badge, openable into a panel/drawer that lists history.
 *
 * Add a new feature kind by widening NotificationKind at a call site
 * (`'orders.shipped' as NotificationKind`). The string literal widens to
 * `Role`-style (string & {}) so we don't need to ship the canonical list.
 */

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger';

/**
 * Free-form feature key, e.g. `'auth.signin'`, `'orders.shipped'`,
 * `'billing.invoice.paid'`. Use dot notation grouped by feature.
 */
export type NotificationKind = string;

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  description?: string;
  /** ISO 8601 string. Always store UTC. */
  timestamp: string;
  read: boolean;
  severity: NotificationSeverity;
  /** Optional CTA. If `actionHref` is set the action renders as a link. */
  actionLabel?: string;
  actionHref?: string;
}

export interface NotificationsListParams {
  /** Opaque cursor returned from a previous page. Omit for first page. */
  cursor?: string;
  /** Server-side filter — when true, only unread items come back. */
  unreadOnly?: boolean;
  /** Page size. Implementations may clamp. */
  limit?: number;
}

export interface NotificationsPage {
  items: Notification[];
  /** Cursor to pass to the next list() call. `null` when no more pages. */
  nextCursor: string | null;
}

export type NotificationsFilter = 'all' | 'unread';

export type Unsubscribe = () => void;
