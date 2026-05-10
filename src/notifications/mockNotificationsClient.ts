import type { NotificationsClient } from './NotificationsClient';
import type {
  Notification,
  NotificationSeverity,
  NotificationsListParams,
  NotificationsPage,
  Unsubscribe,
} from './types';

/*
 * In-memory notifications client backed by localStorage so a session survives
 * a page reload during demos. NOT for production.
 *
 * Replace with a real implementation by writing your own object satisfying
 * NotificationsClient and passing it as
 * <NotificationsProvider client={...}>.
 */

const STORAGE_KEY = 'admin-template-notifications';
const DEFAULT_LIMIT = 10;

const SEED_KINDS: ReadonlyArray<{
  kind: string;
  severity: NotificationSeverity;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}> = [
  {
    kind: 'auth.signin',
    severity: 'info',
    title: 'New sign-in detected',
    description: 'A new device signed in to your account from Berlin, Germany.',
    actionLabel: 'Review activity',
    actionHref: '/admin',
  },
  {
    kind: 'orders.shipped',
    severity: 'success',
    title: 'Order #4821 shipped',
    description: 'Tracking number JX-2391-002. Estimated delivery in 2 days.',
    actionLabel: 'Track shipment',
    actionHref: '/tables',
  },
  {
    kind: 'billing.invoice.paid',
    severity: 'success',
    title: 'Invoice paid',
    description: 'Acme Co. paid invoice INV-2026-0188 ($4,200.00).',
  },
  {
    kind: 'storage.quota.warning',
    severity: 'warning',
    title: 'Storage at 82% capacity',
    description: 'Consider upgrading your plan or archiving old data.',
    actionLabel: 'Manage storage',
    actionHref: '/admin',
  },
  {
    kind: 'security.permission.changed',
    severity: 'warning',
    title: 'Permissions updated',
    description: 'A teammate was promoted to admin by Ada.',
  },
  {
    kind: 'jobs.import.failed',
    severity: 'danger',
    title: 'Import job failed',
    description: 'CSV import "users-2026-05.csv" failed at row 1,204.',
    actionLabel: 'View logs',
    actionHref: '/errors',
  },
  {
    kind: 'comments.mentioned',
    severity: 'info',
    title: 'Mention in #design-review',
    description: 'Edie tagged you on the spec for the new charts page.',
  },
  {
    kind: 'reports.weekly.ready',
    severity: 'info',
    title: 'Your weekly report is ready',
    description: 'Active users +12% week-over-week.',
    actionLabel: 'Open report',
    actionHref: '/charts',
  },
  {
    kind: 'system.maintenance.scheduled',
    severity: 'info',
    title: 'Scheduled maintenance Sunday 02:00 UTC',
    description: 'Expect a 5-minute window of degraded performance.',
  },
  {
    kind: 'security.token.expiring',
    severity: 'warning',
    title: 'API token expires in 3 days',
    description: 'Rotate "ci-deploy" before it expires to avoid pipeline downtime.',
    actionLabel: 'Rotate token',
    actionHref: '/admin',
  },
  {
    kind: 'comments.replied',
    severity: 'info',
    title: 'Reply on your comment',
    description: 'Vic replied to your comment on the auth migration.',
  },
  {
    kind: 'orders.refunded',
    severity: 'warning',
    title: 'Refund processed for order #4790',
    description: '$129.00 refunded to original payment method.',
  },
];

function isoMinutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

function makeSeed(): Notification[] {
  return SEED_KINDS.map((s, i) => ({
    id: `seed_${String(i + 1).padStart(3, '0')}`,
    kind: s.kind,
    severity: s.severity,
    title: s.title,
    ...(s.description !== undefined ? { description: s.description } : {}),
    timestamp: isoMinutesAgo((i + 1) * 17),
    read: i >= 3,
    ...(s.actionLabel !== undefined ? { actionLabel: s.actionLabel } : {}),
    ...(s.actionHref !== undefined ? { actionHref: s.actionHref } : {}),
  }));
}

function readStored(): Notification[] {
  if (typeof window === 'undefined') return makeSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const seed = makeSeed();
      writeStored(seed);
      return seed;
    }
    return JSON.parse(raw) as Notification[];
  } catch {
    return makeSeed();
  }
}

function writeStored(items: Notification[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota/serialization failures
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export interface MockNotificationsClientOptions {
  /** Simulated network latency in ms. Default 200. */
  latencyMs?: number;
  /**
   * Auto-emit a fake new notification every `emitEveryMs` ms via subscribe().
   * `null` disables. Default `null` so tests stay deterministic; the dev
   * singleton enables 30s emission only when import.meta.env.DEV is true.
   */
  emitEveryMs?: number | null;
  /** Override seed data (used by tests for reproducible scenarios). */
  initialItems?: Notification[];
  /** Persist to localStorage. Default true. Tests should pass false. */
  persist?: boolean;
}

export function createMockNotificationsClient(
  opts: MockNotificationsClientOptions = {},
): NotificationsClient {
  const latency = opts.latencyMs ?? 200;
  const persist = opts.persist ?? true;
  const emitEveryMs = opts.emitEveryMs ?? null;

  let items: Notification[] =
    opts.initialItems !== undefined
      ? [...opts.initialItems]
      : persist
        ? readStored()
        : makeSeed();

  let nextId = items.length + 1;
  const subscribers = new Set<(n: Notification) => void>();
  let emitTimer: ReturnType<typeof setInterval> | null = null;

  function commit(): void {
    if (persist) writeStored(items);
  }

  function startEmitterIfNeeded(): void {
    if (emitTimer !== null || emitEveryMs === null || subscribers.size === 0) return;
    if (typeof setInterval === 'undefined') return;
    emitTimer = setInterval(() => {
      const fresh: Notification = {
        id: `live_${nextId++}`,
        kind: 'system.live.tick',
        severity: 'info',
        title: 'Live: subscription event',
        description: 'Auto-emitted by mockNotificationsClient (dev only).',
        timestamp: new Date().toISOString(),
        read: false,
      };
      items = [fresh, ...items];
      commit();
      for (const sub of subscribers) sub(fresh);
    }, emitEveryMs);
  }

  function stopEmitterIfIdle(): void {
    if (emitTimer !== null && subscribers.size === 0) {
      clearInterval(emitTimer);
      emitTimer = null;
    }
  }

  return {
    async list(params: NotificationsListParams = {}): Promise<NotificationsPage> {
      await delay(latency);
      const limit = params.limit ?? DEFAULT_LIMIT;
      const filtered = params.unreadOnly === true ? items.filter((n) => !n.read) : items;
      const startIdx =
        params.cursor !== undefined
          ? filtered.findIndex((n) => n.id === params.cursor) + 1
          : 0;
      const slice = filtered.slice(startIdx, startIdx + limit);
      const nextCursor =
        startIdx + limit < filtered.length && slice.length > 0
          ? (slice[slice.length - 1]?.id ?? null)
          : null;
      return { items: slice, nextCursor };
    },
    async markRead(ids: string[]): Promise<void> {
      await delay(latency);
      const set = new Set(ids);
      items = items.map((n) => (set.has(n.id) ? { ...n, read: true } : n));
      commit();
    },
    async markAllRead(): Promise<void> {
      await delay(latency);
      items = items.map((n) => (n.read ? n : { ...n, read: true }));
      commit();
    },
    async remove(id: string): Promise<void> {
      await delay(latency);
      items = items.filter((n) => n.id !== id);
      commit();
    },
    subscribe(onNew: (n: Notification) => void): Unsubscribe {
      subscribers.add(onNew);
      startEmitterIfNeeded();
      return () => {
        subscribers.delete(onNew);
        stopEmitterIfIdle();
      };
    },
  };
}

/**
 * Default singleton — fine for demos. In dev, emits a fake new notification
 * every 30s while at least one subscriber is mounted, to demonstrate the
 * subscribe channel. In prod / SSR / tests, the emitter stays silent.
 */
export const mockNotificationsClient: NotificationsClient = createMockNotificationsClient({
  emitEveryMs: import.meta.env.DEV === true ? 30_000 : null,
});

/** Reset helper for tests + dev tools. */
export function resetMockNotifications(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
