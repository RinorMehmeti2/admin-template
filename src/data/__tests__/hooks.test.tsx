import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useApiQuery } from '../useApiQuery';
import { useApiMutation } from '../useApiMutation';
import { useInvalidate } from '../useInvalidate';
import { ApiError } from '../api';
import { keys } from '..';

function makeWrapper(client: QueryClient): (props: { children: ReactNode }) => ReactNode {
  return function Wrapper({ children }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function silentClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

describe('useApiQuery', () => {
  it('infers the data type from the fetcher and surfaces ApiError on failure', async () => {
    const fetcher = vi.fn(async (): Promise<{ id: string; name: string }> => ({
      id: 'u_1',
      name: 'Ada',
    }));
    const { result } = renderHook(() => useApiQuery(keys.users.detail('u_1'), fetcher), {
      wrapper: makeWrapper(silentClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Type-level: result.current.data is { id: string; name: string } | undefined
    expect(result.current.data?.name).toBe('Ada');
    expect(fetcher).toHaveBeenCalled();
  });

  it('surfaces ApiError shape on rejection', async () => {
    const err = new ApiError({ status: 500, message: 'boom' });
    const fetcher = vi.fn(async () => {
      throw err;
    });
    const { result } = renderHook(() => useApiQuery(keys.users.list(), fetcher), {
      wrapper: makeWrapper(silentClient()),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    // Type-level: result.current.error is ApiError | null
    expect(result.current.error?.status).toBe(500);
    expect(result.current.error?.message).toBe('boom');
  });
});

describe('useApiMutation', () => {
  it('infers TVariables and TData from mutationFn', async () => {
    interface Variables {
      name: string;
    }
    interface Data {
      id: string;
    }
    const fn = vi.fn(async (vars: Variables): Promise<Data> => ({ id: vars.name }));
    const { result } = renderHook(() => useApiMutation<Data, Variables>(fn), {
      wrapper: makeWrapper(silentClient()),
    });
    const out = await result.current.mutateAsync({ name: 'Ada' });
    expect(out).toEqual({ id: 'Ada' });
    expect(fn).toHaveBeenCalledWith({ name: 'Ada' }, expect.any(Object));
  });

  it('error is typed as ApiError', async () => {
    const fn = vi.fn(async (): Promise<undefined> => {
      throw new ApiError({ status: 422, message: 'invalid', code: 'validation' });
    });
    const onError = vi.fn();
    const { result } = renderHook(() => useApiMutation<undefined, undefined>(fn, { onError }), {
      wrapper: makeWrapper(silentClient()),
    });
    await result.current.mutateAsync(undefined).catch(() => undefined);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.code).toBe('validation');
    expect(onError).toHaveBeenCalled();
  });
});

describe('useInvalidate', () => {
  it('invalidates by key prefix without exact match', async () => {
    const client = silentClient();
    const spy = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useInvalidate(), { wrapper: makeWrapper(client) });
    await result.current(keys.users.lists());
    expect(spy).toHaveBeenCalledWith({ queryKey: keys.users.lists(), exact: false });
  });
});

describe('keys factory', () => {
  it('produces hierarchical keys', () => {
    expect(keys.users.all).toEqual(['users']);
    expect(keys.users.lists()).toEqual(['users', 'list']);
    expect(keys.users.list({ page: 1 })).toEqual(['users', 'list', { page: 1 }]);
    expect(keys.users.detail('u_42')).toEqual(['users', 'detail', 'u_42']);
  });
});
