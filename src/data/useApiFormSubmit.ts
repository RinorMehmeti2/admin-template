import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/context/ToastProvider';
import { isApiError, type ApiError } from './api';
import { mapApiError } from './errorHandler';

/*
 * Glue between react-hook-form and an API mutation.
 *
 * The mutation MUST opt out of the global error dispatcher by passing
 *   meta: { handlesErrors: true }
 * to useApiMutation. Otherwise the global QueryCache / MutationCache
 * handlers will toast the error before this helper sees it.
 *
 * Behavior:
 *   - inline (with fields)  → form.setError per field + optional root message
 *   - inline (no fields)    → form.setError('root.serverError', …)
 *   - toast                 → toast.error(message)
 *   - redirect              → navigate(action.to)
 *   - fatal                 → re-throw so an error boundary catches it
 *
 * Returns a submit handler ready to drop into <form onSubmit={…}> or
 * passed through <Form>'s onSubmit prop. Pair it with form.handleSubmit
 * by handing the result of useApiFormSubmit straight to <Form>.
 */

export interface UseApiFormSubmitOptions<TForm extends FieldValues, TData> {
  /** Called on a successful mutateAsync; useful for redirects / resets. */
  onSuccess?: (data: TData, values: TForm) => void | Promise<void>;
  /**
   * Override when the form has a different shape than the mutation's
   * variables — e.g., you want to transform values before sending.
   */
  toVariables?: (values: TForm) => unknown;
}

export function useApiFormSubmit<TForm extends FieldValues, TData, TVariables = TForm>(
  form: UseFormReturn<TForm>,
  mutation: UseMutationResult<TData, ApiError, TVariables>,
  options?: UseApiFormSubmitOptions<TForm, TData>,
): SubmitHandler<TForm> {
  const { toast } = useToast();
  const navigate = useNavigate();
  const toVariables = options?.toVariables;
  const onSuccess = options?.onSuccess;

  return useCallback<SubmitHandler<TForm>>(
    async (values) => {
      const variables = (toVariables !== undefined ? toVariables(values) : values) as TVariables;
      try {
        const data = await mutation.mutateAsync(variables);
        if (onSuccess !== undefined) await onSuccess(data, values);
      } catch (err) {
        if (!isApiError(err)) throw err;
        const action = mapApiError(err);
        switch (action.kind) {
          case 'inline': {
            const fields = action.fields;
            if (fields !== undefined) {
              for (const [name, message] of Object.entries(fields)) {
                form.setError(name as Path<TForm>, { type: 'server', message });
              }
              if (action.message.length > 0 && Object.keys(fields).length === 0) {
                form.setError('root.serverError', { type: 'server', message: action.message });
              }
            } else {
              form.setError('root.serverError', { type: 'server', message: action.message });
            }
            return;
          }
          case 'toast':
            toast.error(action.message);
            return;
          case 'redirect':
            navigate(action.to);
            return;
          case 'fatal':
            throw action.error;
        }
      }
    },
    [form, mutation, toast, navigate, onSuccess, toVariables],
  );
}
