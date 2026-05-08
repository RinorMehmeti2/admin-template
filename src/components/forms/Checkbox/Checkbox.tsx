import { Check } from 'lucide-react';
import { useEffect, useRef, type InputHTMLAttributes, type Ref } from 'react';
import { cn } from '@/lib/cn';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  ref?: Ref<HTMLInputElement>;
  indeterminate?: boolean;
}

export function Checkbox({
  ref,
  className,
  indeterminate,
  disabled,
  id,
  ...rest
}: CheckboxProps) {
  const internal = useRef<HTMLInputElement>(null);
  const merged = useMergedRefs<HTMLInputElement>(internal, ref);

  const aria = useFieldAriaProps({
    id,
    'aria-describedby': rest['aria-describedby'],
    'aria-invalid': rest['aria-invalid'],
  });

  useEffect(() => {
    if (internal.current !== null) {
      internal.current.indeterminate = indeterminate === true;
    }
  }, [indeterminate]);

  return (
    <span className={cn('relative inline-flex h-4 w-4 shrink-0 align-middle', className)}>
      <input
        ref={merged}
        type="checkbox"
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
          'pointer-events-none absolute inset-0 flex items-center justify-center rounded border border-border bg-surface transition-colors',
          'peer-checked:border-primary peer-checked:bg-primary',
          'peer-indeterminate:border-primary peer-indeterminate:bg-primary',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
          'peer-disabled:opacity-50',
          aria.hasError === true && 'border-danger',
        )}
      />
      <Check
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground opacity-0 peer-indeterminate:opacity-100"
      />
    </span>
  );
}
