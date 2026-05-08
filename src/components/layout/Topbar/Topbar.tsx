import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

export interface TopbarProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** Sticky to top of viewport (default true). */
  sticky?: boolean;
}

export function Topbar({
  ref,
  left,
  center,
  right,
  sticky = true,
  className,
  ...rest
}: TopbarProps) {
  return (
    <header
      ref={ref}
      className={cn(
        'flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur',
        sticky && 'sticky top-0 z-30',
        className,
      )}
      {...rest}
    >
      {left !== undefined ? (
        <div className="flex shrink-0 items-center gap-2">{left}</div>
      ) : null}
      {center !== undefined ? (
        <div className="min-w-0 flex-1">{center}</div>
      ) : (
        <div className="flex-1" />
      )}
      {right !== undefined ? (
        <div className="flex shrink-0 items-center gap-2">{right}</div>
      ) : null}
    </header>
  );
}
