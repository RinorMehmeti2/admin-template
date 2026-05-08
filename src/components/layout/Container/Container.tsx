import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

const containerStyles = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[96rem]',
      full: 'max-w-none',
    },
  },
  defaultVariants: { size: 'lg' },
});

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerStyles> {
  ref?: Ref<HTMLDivElement>;
}

export function Container({ ref, className, size, children, ...rest }: ContainerProps) {
  return (
    <div ref={ref} className={cn(containerStyles({ size }), className)} {...rest}>
      {children}
    </div>
  );
}
