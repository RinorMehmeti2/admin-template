import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationItem } from './NotificationItem';
import { runAxe } from '@/test-utils/a11y';
import type { Notification } from '@/notifications';

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    kind: 'orders.shipped',
    title: 'Order shipped',
    description: 'Your package is on the way.',
    severity: 'success',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    ...overrides,
  };
}

describe('NotificationItem', () => {
  it('renders title, description, and a relative timestamp', () => {
    render(
      <ul>
        <NotificationItem notification={makeNotification()} />
      </ul>,
    );
    expect(screen.getByText('Order shipped')).toBeInTheDocument();
    expect(screen.getByText('Your package is on the way.')).toBeInTheDocument();
    const time = screen.getByRole('time' satisfies string as never) as unknown as HTMLTimeElement | null;
    // jsdom doesn't expose role="time"; query by tagName instead.
    const timeEl = document.querySelector('time');
    expect(timeEl).not.toBeNull();
    expect(timeEl?.textContent ?? '').toMatch(/\d|ago|now|minute|second/i);
    void time;
  });

  it('marks unread visually with aria-current on the listitem', () => {
    render(
      <ul>
        <NotificationItem
          notification={makeNotification({ read: false })}
          onSelect={() => undefined}
        />
      </ul>,
    );
    const li = screen.getByRole('listitem');
    expect(li).toHaveAttribute('aria-current', 'true');
  });

  it('omits aria-current when read', () => {
    render(
      <ul>
        <NotificationItem
          notification={makeNotification({ read: true })}
          onSelect={() => undefined}
        />
      </ul>,
    );
    const li = screen.getByRole('listitem');
    expect(li).not.toHaveAttribute('aria-current');
  });

  it('fires onSelect on click + Enter + Space', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ul>
        <NotificationItem notification={makeNotification()} onSelect={onSelect} />
      </ul>,
    );
    const row = screen.getByRole('button', { name: /order shipped/i });
    await user.click(row);
    expect(onSelect).toHaveBeenCalledTimes(1);
    row.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(2);
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it('renders action as link when actionHref is set, button otherwise', () => {
    const { rerender } = render(
      <ul>
        <NotificationItem
          notification={makeNotification({ actionLabel: 'Track', actionHref: '/x' })}
        />
      </ul>,
    );
    const link = screen.getByRole('link', { name: /track/i });
    expect(link).toHaveAttribute('href', '/x');

    rerender(
      <ul>
        <NotificationItem notification={makeNotification({ actionLabel: 'Track' })} />
      </ul>,
    );
    expect(screen.getByRole('button', { name: /track/i })).toBeInTheDocument();
  });

  it('action click stops propagation so the row does not also select', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onAction = vi.fn();
    render(
      <ul>
        <NotificationItem
          notification={makeNotification({ actionLabel: 'View' })}
          onSelect={onSelect}
          onAction={onAction}
        />
      </ul>,
    );
    await user.click(screen.getByRole('button', { name: /view/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders remove control when onRemove is provided', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <ul>
        <NotificationItem
          notification={makeNotification()}
          onRemove={onRemove}
          labels={{ remove: 'Dismiss notification' }}
        />
      </ul>,
    );
    await user.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('has no a11y violations (default + with action)', async () => {
    const { container } = render(
      <ul>
        <NotificationItem
          notification={makeNotification({
            actionLabel: 'Open',
            actionHref: '/x',
          })}
          onSelect={() => undefined}
          onRemove={() => undefined}
          labels={{ remove: 'Dismiss notification' }}
        />
      </ul>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
