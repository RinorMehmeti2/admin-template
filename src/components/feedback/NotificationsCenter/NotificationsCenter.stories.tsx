import { useRef, useState } from 'react';
import { Card } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { NotificationsProvider } from '@/notifications';
import { createMockNotificationsClient } from '@/notifications/mockNotificationsClient';
import type { Notification, NotificationSeverity } from '@/notifications';
import { NotificationItem } from './NotificationItem';
import { NotificationsBell } from './NotificationsBell';
import { NotificationsPanel } from './NotificationsPanel';

export default { title: 'Feedback/NotificationsCenter' };

function makeItem(
  id: string,
  read: boolean,
  severity: NotificationSeverity,
  title: string,
  description?: string,
  ago = 60_000,
): Notification {
  const base: Notification = {
    id,
    kind: 'demo',
    title,
    severity,
    read,
    timestamp: new Date(Date.now() - ago).toISOString(),
  };
  return description !== undefined ? { ...base, description } : base;
}

const SAMPLE: Notification[] = [
  makeItem('s1', false, 'success', 'Order #4821 shipped', 'Tracking JX-2391 — ETA 2 days.', 60_000),
  makeItem(
    's2',
    false,
    'info',
    'New mention in #design-review',
    'Edie tagged you on the spec.',
    5 * 60_000,
  ),
  makeItem(
    's3',
    false,
    'warning',
    'Storage at 82% capacity',
    'Consider archiving old data.',
    30 * 60_000,
  ),
  makeItem(
    's4',
    true,
    'danger',
    'Import job failed',
    'CSV import failed at row 1,204.',
    60 * 60_000,
  ),
  makeItem(
    's5',
    true,
    'info',
    'Weekly report ready',
    'Active users +12% week-over-week.',
    24 * 60 * 60_000,
  ),
];

function withProvider(items: Notification[], children: React.ReactNode) {
  const client = createMockNotificationsClient({
    initialItems: items,
    persist: false,
    latencyMs: 0,
    emitEveryMs: null,
  });
  return (
    <NotificationsProvider client={client} pageSize={20}>
      {children}
    </NotificationsProvider>
  );
}

export const BellIdle = {
  render: () => withProvider([], <BellRow />),
};

export const BellWithUnread = {
  render: () => withProvider(SAMPLE, <BellRow />),
};

export const PanelOpenPopover = {
  render: () => withProvider(SAMPLE, <PanelHarness presentation="popover" />),
};

export const PanelOpenDrawer = {
  render: () => withProvider(SAMPLE, <PanelHarness presentation="drawer" />),
};

export const PanelEmpty = {
  render: () => withProvider([], <PanelHarness presentation="popover" />),
};

export const ItemVariants = {
  render: () => (
    <Card className="max-w-sm">
      <ul className="flex flex-col">
        <NotificationItem
          notification={makeItem(
            'i1',
            false,
            'info',
            'Info notification',
            'Description text.',
            60_000,
          )}
          onSelect={() => undefined}
        />
        <NotificationItem
          notification={makeItem(
            'i2',
            false,
            'success',
            'Success notification',
            'Description text.',
            5 * 60_000,
          )}
          onSelect={() => undefined}
        />
        <NotificationItem
          notification={{
            ...makeItem(
              'i3',
              false,
              'warning',
              'Warning with action',
              'Description text.',
              30 * 60_000,
            ),
            actionLabel: 'Open report',
            actionHref: '/charts',
          }}
          onSelect={() => undefined}
        />
        <NotificationItem
          notification={{
            ...makeItem(
              'i4',
              false,
              'danger',
              'Danger w/ remove',
              'Description text.',
              60 * 60_000,
            ),
          }}
          onSelect={() => undefined}
          onRemove={() => undefined}
        />
        <NotificationItem
          notification={makeItem(
            'i5',
            true,
            'info',
            'Read item',
            'Description text.',
            24 * 60 * 60_000,
          )}
          onSelect={() => undefined}
        />
      </ul>
    </Card>
  ),
};

function BellRow() {
  return (
    <div className="flex h-14 items-center justify-end gap-2 rounded-md border border-border bg-surface px-4">
      <NotificationsBell persistOpen={false} />
    </div>
  );
}

function PanelHarness({ presentation }: { presentation: 'popover' | 'drawer' }) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-[28rem] items-start justify-center pt-8">
      <Button ref={triggerRef} variant="outline" onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : 'Open'} panel
      </Button>
      <NotificationsPanel
        open={open}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        presentation={presentation}
      />
    </div>
  );
}
