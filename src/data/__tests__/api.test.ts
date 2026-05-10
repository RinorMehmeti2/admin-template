import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient, isApiError } from '../api';

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

type FetchSig = (input: string, init?: RequestInit) => Promise<Response>;

function mockFetch(impl: FetchSig = async () => jsonResponse({})) {
  return vi.fn<FetchSig>(impl);
}

describe('ApiError', () => {
  it('exposes status, code, message, payload', () => {
    const err = new ApiError({
      status: 422,
      message: 'Validation failed',
      code: 'validation',
      payload: { field: 'email' },
    });
    expect(err.status).toBe(422);
    expect(err.code).toBe('validation');
    expect(err.message).toBe('Validation failed');
    expect(err.payload).toEqual({ field: 'email' });
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
    expect(isApiError(err)).toBe(true);
    expect(isApiError(new Error('plain'))).toBe(false);
  });
});

describe('createApiClient — request shape', () => {
  it('joins baseUrl + path and sends JSON body via `json` shorthand', async () => {
    const fetchImpl = mockFetch();
    const client = createApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const result = await client.fetch<{ ok: boolean }>('/users', {
      method: 'POST',
      json: { name: 'Ada' },
    });
    expect(result).toEqual({});
    void result;
    const call = fetchImpl.mock.calls[0]!;
    expect(call[0]).toBe('https://api.example.com/users');
    expect(call[1]?.method).toBe('POST');
    expect(call[1]?.body).toBe(JSON.stringify({ name: 'Ada' }));
    const headers = call[1]?.headers as Headers;
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('attaches Authorization header when getToken returns a token', async () => {
    const fetchImpl = mockFetch();
    const client = createApiClient({
      getToken: () => 'abc123',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await client.fetch('/me');
    const headers = fetchImpl.mock.calls[0]![1]?.headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer abc123');
  });

  it('omits Authorization header when getToken returns null', async () => {
    const fetchImpl = mockFetch();
    const client = createApiClient({
      getToken: () => null,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await client.fetch('/me');
    const headers = fetchImpl.mock.calls[0]![1]?.headers as Headers;
    expect(headers.get('authorization')).toBeNull();
  });

  it('serializes query params', async () => {
    const fetchImpl = mockFetch();
    const client = createApiClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await client.fetch('/users', { query: { page: 2, search: 'ada', deleted: false, skip: null } });
    const url = fetchImpl.mock.calls[0]![0];
    expect(url).toContain('page=2');
    expect(url).toContain('search=ada');
    expect(url).toContain('deleted=false');
    expect(url).not.toContain('skip=');
  });

  it('throws ApiError with parsed JSON body on non-2xx', async () => {
    const fetchImpl = mockFetch(async () =>
      jsonResponse({ code: 'not_found', message: 'No such user' }, 404),
    );
    const client = createApiClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(client.fetch('/users/9')).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'No such user',
    });
  });

  it('throws ApiError with status 0 on network failure', async () => {
    const fetchImpl = mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    const client = createApiClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(client.fetch('/x')).rejects.toMatchObject({ status: 0, code: 'network' });
  });

  it('returns undefined for 204 No Content', async () => {
    const fetchImpl = mockFetch(async () => new Response(null, { status: 204 }));
    const client = createApiClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const result = await client.fetch<undefined>('/x', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });
});

describe('createApiClient — 401 retry-once-then-logout', () => {
  it('retries once after a successful refresh and resolves on the second response', async () => {
    const fetchImpl = vi.fn<FetchSig>();
    fetchImpl.mockResolvedValueOnce(jsonResponse({ message: 'unauthorized' }, 401));
    fetchImpl.mockResolvedValueOnce(jsonResponse({ id: 'u_1' }));
    const refresh = vi.fn(async () => undefined);
    const onAuthFailure = vi.fn();
    const client = createApiClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      refresh,
      onAuthFailure,
    });

    const result = await client.fetch<{ id: string }>('/me');
    expect(result).toEqual({ id: 'u_1' });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('calls onAuthFailure and throws when retry also returns 401', async () => {
    const fetchImpl = vi.fn<FetchSig>();
    fetchImpl.mockResolvedValueOnce(jsonResponse({ message: 'auth' }, 401));
    fetchImpl.mockResolvedValueOnce(jsonResponse({ message: 'still auth' }, 401));
    const refresh = vi.fn(async () => undefined);
    const onAuthFailure = vi.fn();
    const client = createApiClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      refresh,
      onAuthFailure,
    });

    await expect(client.fetch('/me')).rejects.toMatchObject({ status: 401 });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('still retries once and logs out when refresh itself throws', async () => {
    const fetchImpl = vi.fn<FetchSig>();
    fetchImpl.mockResolvedValueOnce(jsonResponse({}, 401));
    fetchImpl.mockResolvedValueOnce(jsonResponse({}, 401));
    const refresh = vi.fn(async () => {
      throw new Error('boom');
    });
    const onAuthFailure = vi.fn();
    const client = createApiClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      refresh,
      onAuthFailure,
    });

    await expect(client.fetch('/me')).rejects.toMatchObject({ status: 401 });
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not retry when no refresh callback is configured', async () => {
    const fetchImpl = mockFetch(async () => jsonResponse({}, 401));
    const onAuthFailure = vi.fn();
    const client = createApiClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      onAuthFailure,
    });
    await expect(client.fetch('/me')).rejects.toMatchObject({ status: 401 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).not.toHaveBeenCalled();
  });
});
