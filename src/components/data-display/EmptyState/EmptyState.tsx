import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ref?: Ref<HTMLDivElement>;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  ref,
  className,
  icon,
  title,
  description,
  action,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
      {...rest}
    >
      {icon !== undefined ? (
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-foreground-muted"
        >
          {icon}
        </span>
      ) : null}
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description !== undefined ? (
          <p className="text-sm text-foreground-muted">{description}</p>
        ) : null}
      </div>
      {action !== undefined ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      ) : null}
    </div>
  );
}
