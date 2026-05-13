import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SectionProps {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/** Consistent card chrome for all /tables/* demo sections. */
export function Section({
  id,
  title,
  description,
  eyebrow,
  actions,
  className,
  contentClassName,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn('space-y-4 scroll-mt-24', className)}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          {eyebrow !== undefined ? (
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          {description !== undefined ? (
            <p className="max-w-3xl text-sm text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {actions !== undefined ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </header>
      <div
        className={cn(
          'rounded-lg border border-border bg-surface p-4 sm:p-6',
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
