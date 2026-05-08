import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

const trackStyles = cva('relative w-full overflow-hidden rounded-full bg-surface-muted', {
  variants: {
    size: {
      sm: 'h-1.5',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: { size: 'md' },
});

const barStyles = cva('h-full rounded-full transition-[width] duration-300 ease-out', {
  variants: {
    variant: {
      default: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'>,
    VariantProps<typeof trackStyles>,
    VariantProps<typeof barStyles> {
  ref?: Ref<HTMLDivElement>;
  value?: number;
  max?: number;
  indeterminate?: boolean;
  /** Accessible label (used as aria-label on the progressbar). */
  label?: string;
}

export function Progress({
  ref,
  className,
  value,
  max = 100,
  variant,
  size,
  indeterminate,
  label,
  ...rest
}: ProgressProps) {
  const isIndeterminate = indeterminate === true;
  const safeValue =
    value !== undefined ? Math.max(0, Math.min(max, value)) : 0;
  const pct = max > 0 ? (safeValue / max) * 100 : 0;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={isIndeterminate ? undefined : safeValue}
      aria-label={label}
      className={cn(trackStyles({ size }), className)}
      {...rest}
    >
      {isIndeterminate ? (
        <div
          aria-hidden="true"
          className={cn(
            barStyles({ variant }),
            'absolute inset-y-0 left-0 w-1/3',
            'motion-safe:animate-progress-indeterminate motion-reduce:w-1/2',
          )}
        />
      ) : (
        <div
          aria-hidden="true"
          className={barStyles({ variant })}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}
