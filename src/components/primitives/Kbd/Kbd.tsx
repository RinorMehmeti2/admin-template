import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
}

export function Kbd({ ref, className, children, ...rest }: KbdProps) {
  return (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex items-center rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[0.7rem] font-medium text-foreground-muted shadow-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}
