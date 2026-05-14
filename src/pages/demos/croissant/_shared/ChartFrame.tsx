import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Card } from '@/components/data-display/Card';
import { Skeleton } from '@/components/primitives/Skeleton';
import type { SectionTone } from './SectionHeader';

const EYEBROW: Record<SectionTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  secondary: 'text-secondary',
  danger: 'text-danger',
};

export interface ChartFrameProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: SectionTone;
  /** Top-right action slot — Buttons, dropdowns, segmented control. */
  action?: ReactNode;
  /** Insight blurb rendered below the chart. */
  insight?: ReactNode;
  loading?: boolean;
  /** Skeleton grid spec when loading. */
  skeletonHeight?: number;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function ChartFrame({
  eyebrow,
  title,
  description,
  tone = 'primary',
  action,
  insight,
  loading = false,
  skeletonHeight = 260,
  className,
  bodyClassName,
  children,
}: ChartFrameProps) {
  return (
    <Card variant="outlined" className={cn('min-h-[18rem]', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 pb-3 pt-5">
        <div className="min-w-0">
          {eyebrow !== undefined ? (
            <p
              className={cn(
                'text-[10px] font-semibold uppercase tracking-[0.12em]',
                EYEBROW[tone],
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-0.5 text-sm font-semibold text-foreground">{title}</h3>
          {description !== undefined ? (
            <p className="mt-0.5 text-xs text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {action !== undefined ? (
          <div className="flex items-center gap-2" data-print="hide">
            {action}
          </div>
        ) : null}
      </header>
      <div className={cn('px-5 py-4', bodyClassName)}>
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton style={{ height: skeletonHeight }} className="w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          children
        )}
      </div>
      {insight !== undefined ? (
        <p className="border-t border-border/60 px-5 py-3 text-xs text-foreground-muted">
          {insight}
        </p>
      ) : null}
    </Card>
  );
}
