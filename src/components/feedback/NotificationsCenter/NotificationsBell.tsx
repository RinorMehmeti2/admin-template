import { useCallback, useEffect, useRef, useState, type Ref } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/primitives/IconButton';
import { useNotifications } from '@/notifications';
import { NotificationsPanel, type NotificationsPanelLabels } from './NotificationsPanel';

const OPEN_KEY = 'admin-template-notifications-open';
const MAX_BADGE = 99;

function readPersisted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

function writePersisted(open: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (open) window.sessionStorage.setItem(OPEN_KEY, '1');
    else window.sessionStorage.removeItem(OPEN_KEY);
  } catch {
    // ignore
  }
}

export interface NotificationsBellProps {
  ref?: Ref<HTMLButtonElement>;
  /** Localized strings forwarded to NotificationsPanel + the trigger. */
  labels?: NotificationsPanelLabels & {
    /** aria-label on the bell button. e.g. "Open notifications". */
    bellLabel?: string;
    /** Visually hidden suffix for the unread count, e.g. "1 unread". */
    unreadSuffix?: (count: number) => string;
  };
  /** BCP-47 locale forwarded to NotificationsPanel for time formatting. */
  locale?: string;
  /** Trigger size. Default `md`. */
  size?: 'sm' | 'md';
  /** Persist open state in sessionStorage. Default true. */
  persistOpen?: boolean;
  className?: string;
}

export function NotificationsBell({
  ref,
  labels,
  locale,
  size = 'md',
  persistOpen = true,
  className,
}: NotificationsBellProps) {
  const { unreadCount } = useNotifications();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== undefined && ref !== null) {
        (ref as { current: HTMLButtonElement | null }).current = node;
      }
    },
    [ref],
  );
  const [open, setOpenState] = useState<boolean>(() => (persistOpen ? readPersisted() : false));

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (persistOpen) writePersisted(next);
    },
    [persistOpen],
  );

  // Clear stale persisted state if the panel content somehow can't open
  // (provider missing). Best-effort no-op otherwise.
  useEffect(() => {
    if (!persistOpen) return;
    if (open && triggerRef.current === null) setOpenState(false);
  }, [open, persistOpen]);

  const bellLabel = labels?.bellLabel ?? 'Open notifications';
  const unreadSuffix =
    labels?.unreadSuffix ?? ((count: number) => (count > 0 ? `, ${count} unread` : ''));
  const displayCount = unreadCount > MAX_BADGE ? `${MAX_BADGE}+` : String(unreadCount);

  return (
    <>
      <IconButton
        ref={setRef}
        aria-label={`${bellLabel}${unreadSuffix(unreadCount)}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        variant="ghost"
        size={size}
        onClick={() => setOpen(!open)}
        className={cn('relative', className)}
        data-testid="notifications-bell"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className={cn(
              'absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-danger-foreground ring-2 ring-surface',
              displayCount.length > 2 ? 'h-4 px-1.5' : 'h-4',
            )}
          >
            {displayCount}
          </span>
        ) : null}
      </IconButton>
      <NotificationsPanel
        open={open}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        labels={labels}
        locale={locale}
      />
    </>
  );
}
