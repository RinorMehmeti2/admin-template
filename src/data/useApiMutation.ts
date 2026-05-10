import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { ApiError } from './api';

/*
 * Typed wrapper around useMutation. Error channel fixed to ApiError so
 * consumer onError handlers can read err.status / err.code without casts.
 */

export type ApiMutationOptions<TData, TVariables, TContext = unknown> = Omit<
  UseMutationOptions<TData, ApiError, TVariables, TContext>,
  'mutationFn'
>;

export function useApiMutation<TData, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: ApiMutationOptions<TData, TVariables, TContext>,
): UseMutationResult<TData, ApiError, TVariables, TContext> {
  return useMutation<TData, ApiError, TVariables, TContext>({
    mutationFn,
    ...options,
  });
}
