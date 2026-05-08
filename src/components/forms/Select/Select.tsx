import { ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Ref, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

/*
 * NOTE: This is a styled NATIVE <select>. The popup uses the OS / browser
 * picker — not a custom listbox. A searchable / multi-select / customizable
 * combobox lives elsewhere (planned `Combobox` primitive built on
 * useRovingFocus + useFocusTrap + Portal). Don't try to make this one
 * stretch into a combobox.
 */

const selectStyles = cva(
  'block w-full appearance-none rounded-md border bg-surface text-foreground pl-3 pr-9 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-border focus-visible:ring-ring',
        error: 'border-danger focus-visible:ring-danger',
      },
      selectSize: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: { variant: 'default', selectSize: 'md' },
  },
);

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectStyles> {
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  ref,
  className,
  variant,
  selectSize,
  children,
  id,
  ...rest
}: SelectProps) {
  const aria = useFieldAriaProps(
    { id, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] },
    variant === 'error',
  );
  const effectiveVariant = variant ?? (aria.hasError ? 'error' : 'default');

  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(selectStyles({ variant: effectiveVariant, selectSize }), className)}
        {...rest}
        id={aria.id}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle"
      />
    </div>
  );
}
