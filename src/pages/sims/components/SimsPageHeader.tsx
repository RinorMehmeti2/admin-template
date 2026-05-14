import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SimsPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SimsPageHeader({ title, description, actions, className }: SimsPageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">{title}</h1>
        {description !== undefined ? (
          <p className="mt-1 text-sm text-foreground-muted">{description}</p>
        ) : null}
      </div>
      {actions !== undefined ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
