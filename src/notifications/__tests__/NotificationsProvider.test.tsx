import { describe, it, expect, vi } from 'vitest';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { NotificationsProvider } from '@/notifications/NotificationsProvider';
import { useNotifications } from '@/notifications/useNotifications';
import { createMockNotificationsClient } from '@/notifications/mockNotificationsClient';
import type { Notification } from '@/notifications/types';

function makeItem(id: string, read = false): Notification {
  return {
    id,
    kind: 'test.kind',
    title: `Item ${id}`,
    severity: 'info',
    timestamp: new Date().toISOString(),
    read,
  };
}

function wrapperWith(children: ReactNode, items: Notification[]) {
  const client = createMockNotificationsClient({
    initialItems: items,
    persist: false,
    latencyMs: 0,
    emitEveryMs: null,
  });
  return { client, ui: <NotificationsProvider client={client} pageSize={3}>{children}</NotificationsProvider> };
}

describe('NotificationsProvider', () => {
  it('loads first page on mount and computes unread count', async () => {
    const items = [
      makeItem('a', false),
      makeItem('b', false),
      makeItem('c', true),
      makeItem('d', false),
    ];
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationsProvider client={client} pageSize={3}>
        {children}
      </NotificationsProvider>
    );
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toHaveLength(3));
    expect(result.current.unreadCount).toBe(2);
    expect(result.current.hasMore).toBe(true);
  });

  it('fetches more pages on demand', async () => {
    const items = [makeItem('a'), makeItem('b'), makeItem('c'), makeItem('d'), makeItem('e')];
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationsProvider client={client} pageSize={2}>
        {children}
      </NotificationsProvider>
    );
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    await act(async () => {
      await result.current.fetchMore();
    });
    expect(result.current.notifications).toHaveLength(4);
    await act(async () => {
      await result.current.fetchMore();
    });
    expect(result.current.notifications).toHaveLength(5);
    expect(result.current.hasMore).toBe(false);
  });

  it('marks single notification read optimistically', async () => {
    const items = [makeItem('a', false), makeItem('b', false)];
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationsProvider client={client} pageSize={10}>
        {children}
      </NotificationsProvider>
    );
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    await act(async () => {
      await result.current.markRead(['a']);
    });
    expect(result.current.notifications.find((n) => n.id === 'a')?.read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it('rolls back markRead on client error', async () => {
    const items = [makeItem('a', false)];
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    client.markRead = vi.fn().mockRejectedValue(new Error('boom'));
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationsProvider client={client} pageSize={10}>
        {children}
      </NotificationsProvider>
    );
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));
    await act(async () => {
      await expect(result.current.markRead(['a'])).rejects.toThrow('boom');
    });
    expect(result.current.notifications[0]!.read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  it('marks all read', async () => {
    const items = [makeItem('a'), makeItem('b'), makeItem('c')];
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationsProvider client={client} pageSize={10}>
        {children}
      </NotificationsProvider>
    );
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.unreadCount).toBe(3));
    await act(async () => {
      await result.current.markAllRead();
    });
    expect(result.current.unreadCount).toBe(0);
  });

  it('prepends fresh notifications from subscribe', async () => {
    const items = [makeItem('a')];
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    let pushFn: ((n: Notification) => void) | null = null;
    const originalSubscribe = client.subscribe.bind(client);
    client.subscribe = (cb) => {
      pushFn = cb;
      return originalSubscribe(cb);
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationsProvider client={client} pageSize={10}>
        {children}
      </NotificationsProvider>
    );
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));
    expect(pushFn).not.toBeNull();
    act(() => {
      pushFn!(makeItem('z'));
    });
    expect(result.current.notifications[0]!.id).toBe('z');
    expect(result.current.unreadCount).toBe(2);
  });

  it('unsubscribes on unmount', () => {
    const items: Notification[] = [];
    const unsub = vi.fn();
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    client.subscribe = vi.fn().mockReturnValue(unsub);
    const { unmount } = render(
      <NotificationsProvider client={client} pageSize={10}>
        <div />
      </NotificationsProvider>,
    );
    unmount();
    expect(unsub).toHaveBeenCalled();
  });

  it('changes filter and re-fetches', async () => {
    const items = [
      makeItem('a', false),
      makeItem('b', true),
      makeItem('c', false),
      makeItem('d', true),
    ];
    const client = createMockNotificationsClient({
      initialItems: items,
      persist: false,
      latencyMs: 0,
      emitEveryMs: null,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationsProvider client={client} pageSize={10}>
        {children}
      </NotificationsProvider>
    );
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.notifications).toHaveLength(4));
    await act(async () => {
      result.current.setFilter('unread');
    });
    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.notifications.every((n) => !n.read)).toBe(true);
  });

  it('throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useNotifications())).toThrow(
      /must be used inside <NotificationsProvider>/,
    );
    spy.mockRestore();
  });
});

// Avoid unused import lint; wrapperWith is re-exported for stories/dev only.
void wrapperWith;
