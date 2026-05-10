import { describe, expect, it } from 'vitest';
import { createQueryClient, DEFAULT_QUERY_OPTIONS } from '../queryClient';
import { ApiError } from '../api';

describe('queryClient defaults', () => {
  it('configures staleTime to 30s and gcTime to 5min', () => {
    const queries = DEFAULT_QUERY_OPTIONS.queries!;
    expect(queries.staleTime).toBe(30_000);
    expect(queries.gcTime).toBe(5 * 60_000);
  });

  it('disables retries on mutations by default', () => {
    expect(DEFAULT_QUERY_OPTIONS.mutations?.retry).toBe(false);
  });

  it('does not retry 4xx ApiError responses', () => {
    const retry = DEFAULT_QUERY_OPTIONS.queries?.retry as (n: number, e: unknown) => boolean;
    expect(retry(0, new ApiError({ status: 404, message: 'not found' }))).toBe(false);
    expect(retry(0, new ApiError({ status: 401, message: 'auth' }))).toBe(false);
  });

  it('retries once on 5xx and network errors', () => {
    const retry = DEFAULT_QUERY_OPTIONS.queries?.retry as (n: number, e: unknown) => boolean;
    expect(retry(0, new ApiError({ status: 500, message: 'boom' }))).toBe(true);
    expect(retry(1, new ApiError({ status: 500, message: 'boom' }))).toBe(false);
    expect(retry(0, new ApiError({ status: 0, message: 'offline', code: 'network' }))).toBe(true);
  });

  it('createQueryClient returns a fresh instance each call', () => {
    const a = createQueryClient();
    const b = createQueryClient();
    expect(a).not.toBe(b);
    expect(a.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });
});
