import { cva, type VariantProps } from 'class-variance-authority';
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

const inputStyles = cva(
  'block w-full rounded-md border bg-surface text-foreground placeholder:text-foreground-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-surface-muted read-only:cursor-default',
  {
    variants: {
      variant: {
        default: 'border-border focus-visible:ring-ring',
        error: 'border-danger focus-visible:ring-danger',
      },
      inputSize: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: { variant: 'default', inputSize: 'md' },
  },
);

export interface InputProps
  // `prefix` on HTMLAttributes is the RDFa `prefix` string attribute — we
  // override it with a ReactNode adornment, so it must be omitted here.
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>,
    VariantProps<typeof inputStyles> {
  ref?: Ref<HTMLInputElement>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Input({
  ref,
  className,
  variant,
  inputSize,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  id,
  ...rest
}: InputProps) {
  const aria = useFieldAriaProps(
    { id, 'aria-describedby': rest['aria-describedby'], 'aria-invalid': rest['aria-invalid'] },
    variant === 'error',
  );
  const effectiveVariant = variant ?? (aria.hasError ? 'error' : 'default');

  const padLeft =
    leftIcon !== undefined ? 'pl-9' : prefix !== undefined ? 'pl-14' : 'pl-3';
  const padRight =
    rightIcon !== undefined ? 'pr-9' : suffix !== undefined ? 'pr-14' : 'pr-3';

  const hasAdornment =
    leftIcon !== undefined ||
    rightIcon !== undefined ||
    prefix !== undefined ||
    suffix !== undefined;

  const inputEl = (
    <input
      ref={ref}
      className={cn(
        inputStyles({ variant: effectiveVariant, inputSize }),
        hasAdornment ? cn(padLeft, padRight) : 'px-3',
        className,
      )}
      {...rest}
      id={aria.id}
      aria-describedby={aria['aria-describedby']}
      aria-invalid={aria['aria-invalid']}
    />
  );

  if (!hasAdornment) return inputEl;

  return (
    <div className="relative">
      {leftIcon !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-foreground-subtle"
        >
          {leftIcon}
        </span>
      ) : null}
      {prefix !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 flex items-center border-r border-border px-3 text-sm text-foreground-muted"
        >
          {prefix}
        </span>
      ) : null}
      {inputEl}
      {rightIcon !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-foreground-subtle"
        >
          {rightIcon}
        </span>
      ) : null}
      {suffix !== undefined ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center border-l border-border px-3 text-sm text-foreground-muted"
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
