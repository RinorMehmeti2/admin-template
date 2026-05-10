import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/primitives/Spinner';

export interface InlineLoaderProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  label?: string;
  /** Hide the visible label. aria-label remains for screen readers. */
  hideLabel?: boolean;
}

export function InlineLoader({
  ref,
  className,
  label = 'Loading',
  hideLabel = false,
  ...rest
}: InlineLoaderProps) {
  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn('inline-flex items-center gap-2 text-sm text-foreground-muted', className)}
      {...rest}
    >
      <Spinner size="sm" label={label} />
      {hideLabel ? <span className="sr-only">{label}</span> : <span>{label}</span>}
    </span>
  );
}
