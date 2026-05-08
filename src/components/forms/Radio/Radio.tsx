import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { useRadioGroup } from '@/components/forms/RadioGroup';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value'> {
  ref?: Ref<HTMLInputElement>;
  value: string;
  /** Optional inline label rendered next to the control. */
  children?: ReactNode;
}

export function Radio({
  ref,
  value,
  className,
  disabled,
  children,
  id,
  name,
  checked,
  onChange,
  ...rest
}: RadioProps) {
  const group = useRadioGroup();
  const aria = useFieldAriaProps({
    id,
    'aria-describedby': rest['aria-describedby'],
    'aria-invalid': rest['aria-invalid'],
  });

  const inGroup = group !== null;
  const groupChecked = inGroup ? group.value === value : undefined;
  const isChecked = inGroup ? groupChecked : checked;
  const groupDisabled = inGroup && group.disabled;
  const isDisabled = disabled === true || groupDisabled;
  const resolvedName = inGroup ? group.name : name;

  const handleChange =
    inGroup
      ? () => group.onValueChange(value)
      : onChange;

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 text-sm',
        isDisabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="relative inline-flex h-4 w-4 shrink-0">
        <input
          ref={ref}
          type="radio"
          name={resolvedName}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...rest}
          id={aria.id}
          aria-describedby={aria['aria-describedby']}
          aria-invalid={aria['aria-invalid']}
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full border border-border bg-surface transition-colors',
            'peer-checked:border-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
            'peer-disabled:opacity-50',
            aria.hasError === true && 'border-danger',
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 peer-checked:opacity-100"
        />
      </span>
      {children !== undefined ? <span>{children}</span> : null}
    </label>
  );
}
