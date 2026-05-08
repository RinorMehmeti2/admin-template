import type { LabelHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';
import { useFormField } from '@/components/forms/FormField/FormFieldContext';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  ref?: Ref<HTMLLabelElement>;
  required?: boolean;
}

export function Label({
  ref,
  className,
  required,
  children,
  htmlFor,
  id,
  ...rest
}: LabelProps) {
  // When inside a FormField, default htmlFor to the field id and id to the labelId.
  const ctx = useFormField();
  const resolvedHtmlFor = htmlFor ?? ctx?.fieldId;
  const resolvedId = id ?? ctx?.labelId;

  return (
    <label
      ref={ref}
      htmlFor={resolvedHtmlFor}
      id={resolvedId}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium text-foreground',
        className,
      )}
      {...rest}
    >
      {children}
      {required === true ? (
        <span className="text-danger" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}
