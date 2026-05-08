import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

const spinnerStyles = cva(
  'inline-block animate-spin rounded-full border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface SpinnerProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerStyles> {
  ref?: Ref<HTMLSpanElement>;
  label?: string;
}

export function Spinner({
  ref,
  className,
  size,
  label = 'Loading',
  ...rest
}: SpinnerProps) {
  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={cn(spinnerStyles({ size }), className)}
      {...rest}
    />
  );
}
