import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

const cardStyles = cva('rounded-lg bg-surface text-foreground', {
  variants: {
    variant: {
      default: '',
      outlined: 'border border-border',
      elevated: 'bg-surface-elevated shadow-md',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyles> {
  ref?: Ref<HTMLDivElement>;
}

export function Card({ ref, className, variant, ...rest }: CardProps) {
  return (
    <div
      ref={ref}
      data-print-block=""
      className={cn(cardStyles({ variant }), className)}
      {...rest}
    />
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function CardHeader({ ref, className, ...rest }: CardHeaderProps) {
  return <div ref={ref} className={cn('flex flex-col gap-1 px-6 pt-6', className)} {...rest} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>;
}

export function CardTitle({ ref, className, children, ...rest }: CardTitleProps) {
  return (
    <h3
      ref={ref}
      className={cn('text-base font-semibold leading-tight text-foreground', className)}
      {...rest}
    >
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
}

export function CardDescription({ ref, className, ...rest }: CardDescriptionProps) {
  return <p ref={ref} className={cn('text-sm text-foreground-muted', className)} {...rest} />;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function CardContent({ ref, className, ...rest }: CardContentProps) {
  return <div ref={ref} className={cn('px-6 py-6', className)} {...rest} />;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function CardFooter({ ref, className, ...rest }: CardFooterProps) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 border-t border-border px-6 py-4', className)}
      {...rest}
    />
  );
}
