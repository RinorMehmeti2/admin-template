import type { InputHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  ref?: Ref<HTMLInputElement>;
}

export function Switch({ ref, className, disabled, id, ...rest }: SwitchProps) {
  const aria = useFieldAriaProps({
    id,
    'aria-describedby': rest['aria-describedby'],
    'aria-invalid': rest['aria-invalid'],
  });
  return (
    <span className={cn('relative inline-flex h-5 w-9 shrink-0', className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        disabled={disabled}
        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...rest}
        id={aria.id}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full border border-border bg-surface-muted transition-colors',
          'peer-checked:border-primary peer-checked:bg-primary',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
          'peer-disabled:opacity-50',
        )}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-surface shadow-sm transition-transform peer-checked:translate-x-4 peer-disabled:opacity-50"
      />
    </span>
  );
}
