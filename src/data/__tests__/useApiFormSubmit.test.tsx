import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { type ReactNode, useEffect } from 'react';
import { ToastProvider, type ToastFn } from '@/context/ToastProvider';
import type * as ToastModule from '@/context/ToastProvider';
import { ApiError } from '../api';
import { ErrorBridge } from '../ErrorBridge';
import { useApiFormSubmit } from '../useApiFormSubmit';
import { useApiMutation } from '../useApiMutation';

interface Values {
  name: string;
  bio: string;
}

const toastSpy = vi.fn();

vi.mock('@/context/ToastProvider', async () => {
  const actual = (await vi.importActual('@/context/ToastProvider')) as typeof ToastModule;
  return {
    ...actual,
    useToast: () => {
      const real = actual.useToast();
      const wrap = (severity: 'success' | 'error' | 'warning' | 'info' | 'neutral') =>
        ((msg: string) => {
          toastSpy(severity, msg);
          return real.toast[severity](msg);
        }) as (msg: string) => string;
      const fn = ((msg: string) => {
        toastSpy('neutral', msg);
        return real.toast(msg);
      }) as ToastFn;
      fn.success = wrap('success');
      fn.error = wrap('error');
      fn.warning = wrap('warning');
      fn.info = wrap('info');
      fn.neutral = wrap('neutral');
      return { ...real, toast: fn };
    },
  };
});

function silentClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

let lastLocation = '/start';
function LocationCapture() {
  const loc = useLocation();
  useEffect(() => {
    lastLocation = loc.pathname;
  }, [loc]);
  return null;
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={silentClient()}>
      <MemoryRouter initialEntries={['/start']}>
        <ToastProvider>
          <ErrorBridge />
          <LocationCapture />
          <Routes>
            <Route path="*" element={<>{children}</>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

interface Harness {
  form: ReturnType<typeof useForm<Values>>;
  setError: ReturnType<typeof vi.fn>;
  submit: ReturnType<typeof useApiFormSubmit<Values, Values, Values>>;
}

function useTestHarness(impl: (vars: Values) => Promise<Values>): Harness {
  const form = useForm<Values>({ defaultValues: { name: '', bio: '' } });
  const setErrorSpy = vi.fn(form.setError);
  // Replace setError so the test can assert calls without depending on the
  // proxy subscription path of formState.errors. RHF's return shape is
  // technically immutable per the lint rule, but stubbing one method here is
  // the lightest-touch way to verify dispatch.
  // eslint-disable-next-line react-hooks/immutability
  form.setError = setErrorSpy as typeof form.setError;
  const mutation = useApiMutation<Values, Values>(impl, { meta: { handlesErrors: true } });
  const submit = useApiFormSubmit(form, mutation);
  return { form, setError: setErrorSpy, submit };
}

describe('useApiFormSubmit', () => {
  it('dispatches per-field errors back into RHF on a 422 fields response', async () => {
    const fn = vi.fn(async (_v: Values): Promise<Values> => {
      throw new ApiError({
        status: 422,
        message: 'invalid',
        payload: { fields: { name: 'Already taken', bio: 'Too short' } },
      });
    });

    const { result } = renderHook(() => useTestHarness(fn), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit({ name: 'a', bio: 'b' });
    });

    expect(result.current.setError).toHaveBeenCalledWith('name', {
      type: 'server',
      message: 'Already taken',
    });
    expect(result.current.setError).toHaveBeenCalledWith('bio', {
      type: 'server',
      message: 'Too short',
    });
  });

  it('writes a form-level message to root.serverError when the API ships no fields', async () => {
    const fn = vi.fn(async (_v: Values): Promise<Values> => {
      throw new ApiError({ status: 422, message: 'Bad data' });
    });

    const { result } = renderHook(() => useTestHarness(fn), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit({ name: 'a', bio: 'b' });
    });

    expect(result.current.setError).toHaveBeenCalledWith('root.serverError', {
      type: 'server',
      message: 'Bad data',
    });
  });

  it('fires toast.error on a 500', async () => {
    toastSpy.mockClear();
    const fn = vi.fn(async (_v: Values): Promise<Values> => {
      throw new ApiError({ status: 500, message: 'kaboom' });
    });

    const { result } = renderHook(() => useTestHarness(fn), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit({ name: 'a', bio: 'b' });
    });

    expect(toastSpy).toHaveBeenCalledWith('error', 'kaboom');
  });

  it('fires a friendlier message on a network failure', async () => {
    toastSpy.mockClear();
    const fn = vi.fn(async (_v: Values): Promise<Values> => {
      throw new ApiError({ status: 0, message: 'fetch failed', code: 'network' });
    });

    const { result } = renderHook(() => useTestHarness(fn), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit({ name: 'a', bio: 'b' });
    });

    expect(toastSpy).toHaveBeenCalledWith(
      'error',
      'Network error. Check your connection and try again.',
    );
  });

  it('navigates to /login on a 401', async () => {
    lastLocation = '/start';
    const fn = vi.fn(async (_v: Values): Promise<Values> => {
      throw new ApiError({ status: 401, message: 'expired' });
    });

    const { result } = renderHook(() => useTestHarness(fn), { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit({ name: 'a', bio: 'b' });
    });

    await waitFor(() => expect(lastLocation).toBe('/login'));
  });

  it('runs onSuccess on a successful mutation', async () => {
    const fn = vi.fn(async (v: Values): Promise<Values> => v);
    const onSuccess = vi.fn();

    function useHarness() {
      const form = useForm<Values>({ defaultValues: { name: '', bio: '' } });
      const mutation = useApiMutation<Values, Values>(fn, { meta: { handlesErrors: true } });
      const submit = useApiFormSubmit(form, mutation, { onSuccess });
      return { submit };
    }

    const { result } = renderHook(useHarness, { wrapper: Wrapper });

    await act(async () => {
      await result.current.submit({ name: 'Ada', bio: 'hi' });
    });

    expect(onSuccess).toHaveBeenCalledWith({ name: 'Ada', bio: 'hi' }, { name: 'Ada', bio: 'hi' });
  });

  it('re-throws fatal errors so the boundary can catch them', async () => {
    const fn = vi.fn(async (_v: Values): Promise<Values> => {
      // 301 is unmapped → fatal.
      throw new ApiError({ status: 301, message: 'weird' });
    });

    const { result } = renderHook(() => useTestHarness(fn), { wrapper: Wrapper });

    await expect(
      act(async () => {
        await result.current.submit({ name: 'a', bio: 'b' });
      }),
    ).rejects.toThrow('weird');
  });
});
