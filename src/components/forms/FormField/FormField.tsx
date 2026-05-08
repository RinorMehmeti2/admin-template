import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Label } from '@/components/forms/Label';
import { FormFieldContext, type FormFieldContextValue } from './FormFieldContext';

export interface FormFieldProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Render the label visually but keep it accessible (sr-only). */
  hideLabel?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

function isErrorPresent(error: ReactNode): boolean {
  if (error === undefined || error === null || error === false) return false;
  if (typeof error === 'string') return error.length > 0;
  return true;
}

export function FormField({
  label,
  description,
  error,
  required,
  hideLabel,
  children,
  className,
  id: idProp,
}: FormFieldProps) {
  const generated = useId();
  const fieldId = idProp ?? `field-${generated}`;
  const labelId = label !== undefined ? `${fieldId}-label` : undefined;
  const descriptionId = description !== undefined ? `${fieldId}-desc` : undefined;
  const hasError = isErrorPresent(error);
  const errorId = hasError ? `${fieldId}-error` : undefined;

  const ctx: FormFieldContextValue = {
    fieldId,
    labelId,
    descriptionId,
    errorId,
    hasError,
  };

  return (
    <FormFieldContext.Provider value={ctx}>
      <div className={cn('space-y-1.5', className)}>
        {label !== undefined ? (
          <Label
            htmlFor={fieldId}
            id={labelId}
            {...(required === true ? { required: true } : {})}
            {...(hideLabel === true ? { className: 'sr-only' } : {})}
          >
            {label}
          </Label>
        ) : null}
        {description !== undefined ? (
          <p id={descriptionId} className="text-xs text-foreground-muted">
            {description}
          </p>
        ) : null}
        {children}
        {hasError ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
}
