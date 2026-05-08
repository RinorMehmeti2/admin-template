import type { FormHTMLAttributes, ReactNode } from 'react';
import {
  FormProvider as RHFFormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';

/*
 * Thin layer over react-hook-form. Consumers still call `useForm` directly.
 * `Form` only:
 *   - wraps in RHF FormProvider so deeply-nested controls can use useFormContext
 *   - calls form.handleSubmit(onSubmit) for you
 *   - sets noValidate by default (we render our own error UI via FormField)
 */

export interface FormProps<T extends FieldValues>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
}

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  noValidate = true,
  ...rest
}: FormProps<T>) {
  return (
    <RHFFormProvider {...form}>
      <form noValidate={noValidate} onSubmit={form.handleSubmit(onSubmit)} {...rest}>
        {children}
      </form>
    </RHFFormProvider>
  );
}

// Re-exports so consumers have one place to grab RHF + zod resolver from.
export {
  Controller,
  useController,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
export { zodResolver } from '@hookform/resolvers/zod';
