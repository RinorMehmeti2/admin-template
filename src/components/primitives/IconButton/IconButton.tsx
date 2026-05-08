import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/primitives/Spinner';

const iconButtonStyles = cva(
  'inline-flex items-center justify-center rounded-md p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'bg-surface-muted text-foreground hover:bg-surface-muted/70 border border-border',
        ghost: 'text-foreground hover:bg-surface-muted',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-surface-muted',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90',
        link: 'text-primary hover:bg-surface-muted',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>,
    VariantProps<typeof iconButtonStyles> {
  ref?: Ref<HTMLButtonElement>;
  /** Required: every icon-only button needs an accessible name. */
  'aria-label': string;
  isLoading?: boolean;
  children: ReactNode;
}

export function IconButton({
  ref,
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonStyles({ variant, size }), className)}
      disabled={disabled === true || isLoading === true}
      aria-busy={isLoading === true ? true : undefined}
      {...rest}
    >
      {isLoading === true ? <Spinner size="sm" /> : children}
    </button>
  );
}
