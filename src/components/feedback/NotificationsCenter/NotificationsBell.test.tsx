import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsProvider } from '@/notifications';
import { createMockNotificationsClient } from '@/notifications/mockNotificationsClient';
import type { Notification } from '@/notifications';
import { NotificationsBell } from './NotificationsBell';
import { runAxe } from '@/test-utils/a11y';

function makeItem(id: string, read = false): Notification {
  return {
    id,
    kind: 'test',
    title: `Item ${id}`,
    severity: 'info',
    timestamp: new Date(Date.now() - 60_000).toISOString(),
    read,
  };
}

function wrap(items: Notification[]) {
  const client = createMockNotificationsClient({
    initialItems: items,
    persist: false,
    latencyMs: 0,
    emitEveryMs: null,
  });
  return (
    <NotificationsProvider client={client} pageSize={10}>
      <NotificationsBell persistOpen={false} />
    </NotificationsProvider>
  );
}

describe('NotificationsBell', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders the bell with an accessible label', () => {
    render(wrap([]));
    expect(screen.getByRole('button', { name: /open notifications/i })).toBeInTheDocument();
  });

  it('shows the unread count once loaded and updates the label', async () => {
    render(wrap([makeItem('a'), makeItem('b'), makeItem('c', true)]));
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /open notifications, 2 unread/i }),
      ).toBeInTheDocument();
    });
    // The numeric badge is decorative (aria-hidden); look up by text instead.
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides the badge when there are no unread items', async () => {
    render(wrap([makeItem('a', true)]));
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /open notifications/i }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText('1')).toBeNull();
  });

  it('toggles the panel on click and updates aria-expanded', async () => {
    const user = userEvent.setup();
    render(wrap([makeItem('a')]));
    const bell = screen.getByRole('button', { name: /open notifications/i });
    expect(bell).toHaveAttribute('aria-expanded', 'false');
    await user.click(bell);
    expect(bell).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
    await user.click(bell);
    expect(bell).toHaveAttribute('aria-expanded', 'false');
  });

  it('caps the badge at 99+ for very large counts', async () => {
    const many = Array.from({ length: 150 }, (_, i) => makeItem(`n${i}`));
    render(
      <NotificationsProvider
        client={createMockNotificationsClient({
          initialItems: many,
          persist: false,
          latencyMs: 0,
          emitEveryMs: null,
        })}
        pageSize={200}
      >
        <NotificationsBell persistOpen={false} />
      </NotificationsProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  it('persists openness across re-renders via sessionStorage when persistOpen', async () => {
    const user = userEvent.setup();
    const client = createMockNotificationsClient({
      initialItems: [makeItem('a')],
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    const { unmount } = render(
      <NotificationsProvider client={client} pageSize={10}>
        <NotificationsBell />
      </NotificationsProvider>,
    );
    await user.click(screen.getByRole('button', { name: /open notifications/i }));
    expect(window.sessionStorage.getItem('admin-template-notifications-open')).toBe('1');
    unmount();
    render(
      <NotificationsProvider client={client} pageSize={10}>
        <NotificationsBell />
      </NotificationsProvider>,
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('has no a11y violations (default render)', async () => {
    const { container } = render(wrap([makeItem('a'), makeItem('b', true)]));
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
