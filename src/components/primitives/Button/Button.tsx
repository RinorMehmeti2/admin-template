import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/primitives/Spinner';

export const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
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
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    compoundVariants: [
      // Link variant ignores button-style sizing: stays inline-flow.
      { variant: 'link', class: 'h-auto px-0 py-0' },
    ],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  ref?: Ref<HTMLButtonElement>;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  ref,
  className,
  variant,
  size,
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const showLeft = isLoading === true ? <Spinner size="sm" /> : leftIcon;
  const showRight = isLoading === true ? null : rightIcon;
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled === true || isLoading === true}
      aria-busy={isLoading === true ? true : undefined}
      {...rest}
    >
      {showLeft}
      {children}
      {showRight}
    </button>
  );
}
