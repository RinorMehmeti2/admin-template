import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  ref?: Ref<HTMLElement>;
  title: ReactNode;
  description?: ReactNode;
  /** Slot above the title (e.g. <Breadcrumbs />). */
  breadcrumbs?: ReactNode;
  /** Slot to the right of the title (buttons). */
  actions?: ReactNode;
}

export function PageHeader({
  ref,
  title,
  description,
  breadcrumbs,
  actions,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <header ref={ref} className={cn('space-y-3 pb-6', className)} {...rest}>
      {breadcrumbs}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description !== undefined ? (
            <p className="mt-1 text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {actions !== undefined ? (
          <div className="flex shrink-0 items-center gap-2" data-print="hide">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
