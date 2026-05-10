import type { Notification } from '@/notifications';

export interface NotificationItemProps {
  notification: Notification;
  /** Called when the user clicks the row. Default: marks read + follows action. */
  onSelect?: (notification: Notification) => void;
  /** Called when the action button/link is activated. */
  onAction?: (notification: Notification) => void;
  /** Optional dismiss handler — renders a remove control when provided. */
  onRemove?: (notification: Notification) => void;
  /** Locale for the relative-time label. Defaults to undefined (browser default). */
  locale?: string | undefined;
  /** Localized labels — pass from i18n at the call site. */
  labels?: {
    /** aria-label for the remove control. e.g. "Dismiss notification". */
    remove?: string;
  };
}
