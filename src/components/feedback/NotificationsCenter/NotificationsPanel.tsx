import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { BellOff, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFocusReturn } from '@/hooks/useFocusReturn';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { usePosition } from '@/hooks/usePosition';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Portal } from '@/components/overlays/Portal';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useNotifications } from '@/notifications';
import { NotificationItem } from './NotificationItem';

export interface NotificationsPanelLabels {
  title?: string;
  markAllRead?: string;
  filterAll?: string;
  filterUnread?: string;
  empty?: string;
  emptyDescription?: string;
  loading?: string;
  remove?: string;
  closeLabel?: string;
}

export interface NotificationsPanelProps {
  ref?: Ref<HTMLDivElement>;
  /** Controlled open state. */
  open: boolean;
  /** Triggered when the user dismisses (Escape, outside click, mobile close). */
  onOpenChange: (open: boolean) => void;
  /** Trigger ref — used to anchor the desktop popover and return focus on close. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Localized strings; sensible English defaults if omitted. */
  labels?: NotificationsPanelLabels | undefined;
  /** BCP-47 locale for relative-time formatting. */
  locale?: string | undefined;
  /** Called when an item without an action is selected. */
  onSelect?: ((id: string) => void) | undefined;
  /** Force the drawer presentation regardless of viewport (useful in stories). */
  presentation?: 'auto' | 'popover' | 'drawer';
  className?: string;
}

const DEFAULT_LABELS: Required<NotificationsPanelLabels> = {
  title: 'Notifications',
  markAllRead: 'Mark all read',
  filterAll: 'All',
  filterUnread: 'Unread',
  empty: 'You are all caught up',
  emptyDescription: 'New notifications will appear here.',
  loading: 'Loading…',
  remove: 'Dismiss notification',
  closeLabel: 'Close notifications',
};

/*
 * Composes Portal + usePosition + useFocusTrap + useClickOutside + useEscapeKey
 * for the desktop popover; switches to a fixed-position bottom drawer on
 * narrow viewports (<640px) via useMediaQuery. Reusing the existing <Drawer>
 * primitive is overkill — we'd inherit a header with a close X we don't want.
 */
export function NotificationsPanel({
  ref,
  open,
  onOpenChange,
  triggerRef,
  labels,
  locale,
  onSelect,
  presentation = 'auto',
  className,
}: NotificationsPanelProps) {
  const merged = { ...DEFAULT_LABELS, ...labels };
  const {
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
  } = useNotifications();

  const panelRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const setPanelRef = useMergedRefs<HTMLDivElement>(panelRef, ref);
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const drawerMode = presentation === 'drawer' || (presentation === 'auto' && isNarrow);

  // Position only matters in popover mode; passing enabled keeps it inert in
  // drawer mode (no recompute on scroll).
  const position = usePosition(triggerRef, panelRef, {
    placement: 'bottom-end',
    offset: 8,
    enabled: open && !drawerMode,
    flip: true,
    shift: true,
  });

  useFocusReturn(open);
  useFocusTrap(panelRef, { active: open, returnFocus: false });
  useEscapeKey(() => onOpenChange(false), { enabled: open });
  useClickOutside(
    panelRef,
    (event) => {
      // Ignore clicks on the trigger so toggle behavior works.
      const trigger = triggerRef.current;
      if (trigger !== null && event.target instanceof Node && trigger.contains(event.target)) {
        return;
      }
      onOpenChange(false);
    },
    { enabled: open },
  );

  useIntersectionObserver(sentinelRef, fetchMore, {
    enabled: open && hasMore && !isLoading,
    rootMargin: '0px 0px 100px 0px',
  });

  const handleItemSelect = useCallback(
    (id: string, hasHref: boolean) => {
      void markRead([id]);
      if (!hasHref) onSelect?.(id);
    },
    [markRead, onSelect],
  );

  // Restore focus into the panel when transitioning from closed → open.
  useEffect(() => {
    if (!open) return;
    const node = panelRef.current;
    if (node === null) return;
    const focusable = node.querySelector<HTMLElement>(
      'button:not([disabled]), [tabindex="0"], a[href]',
    );
    focusable?.focus();
  }, [open]);

  const popoverStyle = useMemo(
    () =>
      drawerMode
        ? undefined
        : ({
            position: 'absolute' as const,
            left: position.x,
            top: position.y,
            visibility: position.ready ? ('visible' as const) : ('hidden' as const),
          }),
    [drawerMode, position.x, position.y, position.ready],
  );

  if (!open) return null;

  const headerId = 'notifications-panel-title';

  const list: ReactNode = (() => {
    if (notifications.length === 0 && !isLoading) {
      return (
        <EmptyState
          icon={<BellOff className="h-5 w-5" aria-hidden="true" />}
          title={merged.empty}
          description={merged.emptyDescription}
        />
      );
    }
    return (
      <ul className="flex flex-col">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            locale={locale}
            labels={{ remove: merged.remove }}
            onSelect={() => handleItemSelect(n.id, n.actionHref !== undefined)}
            onAction={() => {
              void markRead([n.id]);
              if (n.actionHref === undefined) onSelect?.(n.id);
            }}
            onRemove={(notification) => {
              void remove(notification.id);
            }}
          />
        ))}
        {hasMore ? (
          <li>
            <div
              ref={sentinelRef}
              role="status"
              aria-label={merged.loading}
              className="flex items-center justify-center py-3 text-xs text-foreground-subtle"
            >
              {isLoading ? merged.loading : ''}
            </div>
          </li>
        ) : null}
      </ul>
    );
  })();

  const baseClasses =
    'z-50 flex flex-col overflow-hidden border border-border bg-surface text-foreground shadow-lg';
  const sizing = drawerMode
    ? 'fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-x-0 border-b-0 motion-safe:animate-drawer-in-bottom'
    : 'w-[22rem] max-w-[calc(100vw-1rem)] rounded-md';

  return (
    <Portal>
      {drawerMode ? (
        <div
          aria-hidden="true"
          data-print="hide"
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm motion-safe:animate-overlay-in"
          onClick={() => onOpenChange(false)}
        />
      ) : null}
      <div
        ref={setPanelRef}
        role="dialog"
        aria-modal={drawerMode ? 'true' : undefined}
        aria-labelledby={headerId}
        data-print="hide"
        data-side={position.placement}
        tabIndex={-1}
        style={popoverStyle}
        className={cn(baseClasses, sizing, className)}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <h2 id={headerId} className="flex-1 text-sm font-semibold text-foreground">
            {merged.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void markAllRead();
            }}
            disabled={unreadCount === 0}
            leftIcon={<Check className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            {merged.markAllRead}
          </Button>
        </div>
        <div
          role="tablist"
          aria-label={merged.title}
          className="flex gap-1 border-b border-border px-2 py-2"
        >
          <FilterTab
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label={merged.filterAll}
          />
          <FilterTab
            active={filter === 'unread'}
            onClick={() => setFilter('unread')}
            label={merged.filterUnread}
            count={unreadCount}
          />
        </div>
        <div className="max-h-[26rem] flex-1 overflow-y-auto">{list}</div>
      </div>
    </Portal>
  );
}

interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}

function FilterTab({ active, onClick, label, count }: FilterTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
      )}
    >
      {label}
      {count !== undefined && count > 0 ? (
        <span
          className={cn(
            'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] leading-none',
            active ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-foreground-muted',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
