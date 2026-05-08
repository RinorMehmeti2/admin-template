import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

const badgeStyles = cva('inline-flex items-center gap-1.5 rounded-full font-medium', {
  variants: {
    variant: {
      neutral: 'bg-surface-muted text-foreground',
      primary: 'bg-primary/15 text-primary',
      success: 'bg-success/15 text-success',
      warning: 'bg-warning/15 text-warning',
      danger: 'bg-danger/15 text-danger',
      info: 'bg-info/15 text-info',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'sm' },
});

const dotStyles = cva('inline-block rounded-full', {
  variants: {
    variant: {
      neutral: 'bg-foreground-muted',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
    },
    size: {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'sm' },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {
  ref?: Ref<HTMLSpanElement>;
  dot?: boolean;
}

export function Badge({
  ref,
  className,
  variant,
  size,
  dot,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span ref={ref} className={cn(badgeStyles({ variant, size }), className)} {...rest}>
      {dot === true ? (
        <span className={dotStyles({ variant, size })} aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
