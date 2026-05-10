import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/primitives/Spinner';

export interface PageLoaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  label?: string;
  /** Hide the visible label text. The aria-label remains for screen readers. */
  hideLabel?: boolean;
}

export function PageLoader({
  ref,
  className,
  label = 'Loading',
  hideLabel = false,
  ...rest
}: PageLoaderProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex min-h-[12rem] w-full flex-col items-center justify-center gap-3 p-8 text-foreground-muted',
        className,
      )}
      {...rest}
    >
      <Spinner size="lg" label={label} />
      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="text-sm">{label}</span>
      )}
    </div>
  );
}
