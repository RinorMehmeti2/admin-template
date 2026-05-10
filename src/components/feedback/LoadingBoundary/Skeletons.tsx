import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/primitives/Skeleton';

/*
 * Preset skeleton compositions matching common page layouts. Each is a thin
 * arrangement of the Skeleton primitive — no animation logic, no aria; the
 * primitive already handles aria-hidden + animate-pulse. Wrap the whole
 * preset in a role="status" landmark when it's the sole loading surface.
 *
 * Why presets exist: the four shapes below cover ~90% of route-level loading
 * states and let teams adopt suspense without re-deciding skeleton shape on
 * every page.
 */

export interface SkeletonPresetProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Number of repeated rows / cards / fields. */
  count?: number;
}

export interface SkeletonGridProps extends SkeletonPresetProps {
  /** Tailwind-friendly column count. Defaults to 3. */
  columns?: 1 | 2 | 3 | 4;
}

const gridColsClass: Record<NonNullable<SkeletonGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function SkeletonGrid({
  ref,
  className,
  count = 6,
  columns = 3,
  ...rest
}: SkeletonGridProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('grid gap-4', gridColsClass[columns], className)}
      {...rest}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-lg border border-border bg-surface p-4"
          aria-hidden="true"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ ref, className, count = 5, ...rest }: SkeletonPresetProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('space-y-3', className)}
      {...rest}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3" aria-hidden="true">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface SkeletonTableProps extends SkeletonPresetProps {
  /** Number of column placeholders per row. Defaults to 4. */
  columns?: number;
}

export function SkeletonTable({
  ref,
  className,
  count = 8,
  columns = 4,
  ...rest
}: SkeletonTableProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('overflow-hidden rounded-lg border border-border bg-surface', className)}
      {...rest}
    >
      <div
        className="flex gap-4 border-b border-border bg-surface-muted px-4 py-3"
        aria-hidden="true"
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: count }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 px-4 py-3" aria-hidden="true">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonForm({ ref, className, count = 4, ...rest }: SkeletonPresetProps) {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('space-y-5', className)}
      {...rest}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2" aria-hidden="true">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-2" aria-hidden="true">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}
