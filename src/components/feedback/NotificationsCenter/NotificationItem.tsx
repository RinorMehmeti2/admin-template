import { type KeyboardEvent as ReactKeyboardEvent, type Ref } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import type { NotificationSeverity } from '@/notifications';
import type { NotificationItemProps } from './NotificationsCenter.types';

const dotStyles = cva('mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full', {
  variants: {
    severity: {
      info: 'bg-info',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
    },
  },
});

const RTF_UNITS: ReadonlyArray<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
];

function formatRelative(iso: string, locale?: string): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return '';
  const diff = target - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const { unit, ms } of RTF_UNITS) {
    if (Math.abs(diff) >= ms || unit === 'second') {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return '';
}

export interface NotificationItemComponentProps extends NotificationItemProps {
  ref?: Ref<HTMLLIElement>;
  className?: string;
}

/*
 * A11y note: the li stays a plain listitem (axe `list` rule rejects li
 * with role="button"). The interactive surface is a nested div role="button".
 * Action + remove controls are siblings OUTSIDE that div so axe's
 * nested-interactive rule is happy.
 */
export function NotificationItem({
  ref,
  notification,
  onSelect,
  onAction,
  onRemove,
  locale,
  labels,
  className,
}: NotificationItemComponentProps) {
  const { id, title, description, timestamp, read, severity, actionLabel, actionHref } =
    notification;
  const relative = formatRelative(timestamp, locale);
  const absolute = (() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(timestamp));
    } catch {
      return timestamp;
    }
  })();

  const handleSelect = () => onSelect?.(notification);
  const handleKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  };
  const handleAction = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onAction?.(notification);
  };
  const handleRemove = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onRemove?.(notification);
  };

  const interactive = onSelect !== undefined;
  const titleId = `notif-title-${id}`;

  return (
    <li
      ref={ref}
      aria-current={!read ? 'true' : undefined}
      className={cn(
        'group relative border-b border-border last:border-b-0',
        !read && 'bg-primary/[0.04]',
        className,
      )}
    >
      <div
        {...(interactive
          ? {
              role: 'button',
              tabIndex: 0,
              onClick: handleSelect,
              onKeyDown: handleKey,
              'aria-labelledby': titleId,
            }
          : {})}
        className={cn(
          'flex gap-3 px-4 py-3 transition-colors',
          interactive &&
            'cursor-pointer hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
          // Reserve space for the absolute-positioned remove button.
          onRemove !== undefined && 'pr-9',
        )}
      >
        <span
          aria-hidden="true"
          className={dotStyles({ severity: severity as NotificationSeverity })}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              id={titleId}
              className={cn(
                'truncate text-sm leading-snug text-foreground',
                !read && 'font-semibold',
              )}
            >
              {title}
            </p>
            <time
              dateTime={timestamp}
              title={absolute}
              className="shrink-0 text-xs text-foreground-subtle"
            >
              {relative}
            </time>
          </div>
          {description !== undefined ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted">{description}</p>
          ) : null}
        </div>
      </div>

      {actionLabel !== undefined ? (
        <div className="-mt-2 px-4 pb-3 pl-9">
          {actionHref !== undefined ? (
            <a
              href={actionHref}
              onClick={handleAction}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {actionLabel}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {actionLabel}
            </button>
          )}
        </div>
      ) : null}

      {onRemove !== undefined ? (
        <button
          type="button"
          aria-label={labels?.remove ?? 'Dismiss notification'}
          onClick={handleRemove}
          className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-foreground-subtle opacity-0 transition-opacity hover:bg-surface-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </li>
  );
}
