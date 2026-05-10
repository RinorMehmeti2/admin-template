import { useRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsProvider } from '@/notifications';
import { createMockNotificationsClient } from '@/notifications/mockNotificationsClient';
import type { Notification } from '@/notifications';
import { NotificationsPanel } from './NotificationsPanel';
import { runAxe } from '@/test-utils/a11y';

function makeItem(id: string, read = false, overrides: Partial<Notification> = {}): Notification {
  return {
    id,
    kind: 'test',
    title: `Item ${id}`,
    description: `desc ${id}`,
    severity: 'info',
    timestamp: new Date(Date.now() - 60_000).toISOString(),
    read,
    ...overrides,
  };
}

interface HarnessProps {
  items: Notification[];
  defaultOpen?: boolean;
  presentation?: 'auto' | 'popover' | 'drawer';
}

function Harness({ items, defaultOpen = true, presentation = 'popover' }: HarnessProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const client = createMockNotificationsClient({
    initialItems: items,
    persist: false,
    latencyMs: 0,
    emitEveryMs: null,
  });
  return (
    <NotificationsProvider client={client} pageSize={3}>
      <button ref={triggerRef} type="button" onClick={() => setOpen((o) => !o)}>
        Open
      </button>
      <NotificationsPanel
        open={open}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        presentation={presentation}
      />
    </NotificationsProvider>
  );
}

describe('NotificationsPanel', () => {
  it('renders a dialog with header and items', async () => {
    render(<Harness items={[makeItem('a'), makeItem('b')]} />);
    expect(await screen.findByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
    expect(await screen.findByText('Item a')).toBeInTheDocument();
    expect(screen.getByText('Item b')).toBeInTheDocument();
  });

  it('marks an item read on click', async () => {
    const user = userEvent.setup();
    render(<Harness items={[makeItem('a', false)]} />);
    const dialog = await screen.findByRole('dialog');
    await screen.findByText('Item a');
    const li = within(dialog).getByRole('listitem');
    expect(li).toHaveAttribute('aria-current', 'true');
    const interactive = within(dialog).getByRole('button', { name: /item a/i });
    await user.click(interactive);
    await waitFor(() => {
      expect(within(dialog).getByRole('listitem')).not.toHaveAttribute('aria-current');
    });
  });

  it('mark-all-read clears the unread count badge in the unread tab', async () => {
    const user = userEvent.setup();
    render(<Harness items={[makeItem('a', false), makeItem('b', false)]} />);
    const button = await screen.findByRole('button', { name: /mark all read/i });
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
    await user.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('switches to the unread filter via the tab', async () => {
    const user = userEvent.setup();
    render(<Harness items={[makeItem('a', false), makeItem('b', true)]} />);
    const unreadTab = await screen.findByRole('tab', { name: /unread/i });
    await user.click(unreadTab);
    await waitFor(() => {
      expect(screen.queryByText('Item b')).toBeNull();
    });
    expect(screen.getByText('Item a')).toBeInTheDocument();
  });

  it('renders empty state when no items', async () => {
    render(<Harness items={[]} />);
    expect(await screen.findByText(/all caught up/i)).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness items={[makeItem('a')]} />);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('renders a backdrop when in drawer presentation', async () => {
    render(<Harness items={[makeItem('a')]} presentation="drawer" />);
    await screen.findByRole('dialog');
    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
  });

  it('does not render when open=false', () => {
    render(<Harness items={[makeItem('a')]} defaultOpen={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('uses an IntersectionObserver sentinel for paginated lists', async () => {
    let captured: IntersectionObserverCallback | null = null;
    const observed: Element[] = [];
    const original = globalThis.IntersectionObserver as typeof IntersectionObserver | undefined;
    class MockIO {
      callback: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.callback = cb;
        captured = cb;
      }
      observe(node: Element) {
        observed.push(node);
      }
      disconnect() {}
      unobserve() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }
    // @ts-expect-error — minimal jsdom mock
    globalThis.IntersectionObserver = MockIO;

    render(
      <Harness
        items={[makeItem('a'), makeItem('b'), makeItem('c'), makeItem('d'), makeItem('e')]}
      />,
    );
    await screen.findByText('Item a');
    expect(captured).not.toBeNull();
    act(() => {
      captured!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Item d')).toBeInTheDocument();
    });

    if (original !== undefined) {
      globalThis.IntersectionObserver = original;
    }
    void observed;
  });

  it('has no a11y violations (open + items)', async () => {
    render(<Harness items={[makeItem('a'), makeItem('b', true)]} />);
    await screen.findByText('Item a');
    expect(await runAxe(document.body)).toHaveNoViolations();
  });

  it('has no a11y violations (open + empty)', async () => {
    render(<Harness items={[]} />);
    await screen.findByText(/all caught up/i);
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});

// Silence unused-handler warning in tests: ensure mock client is imported elsewhere
void vi;
