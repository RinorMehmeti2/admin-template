import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
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

/** SIMS-style outlined card section used across all /forms/* demos. */
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
    <section id={id} className={cn('scroll-mt-24', className)}>
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {eyebrow !== undefined ? (
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                {eyebrow}
              </p>
            ) : null}
            <CardTitle className="text-lg">{title}</CardTitle>
            {description !== undefined ? (
              <CardDescription className="max-w-3xl">{description}</CardDescription>
            ) : null}
          </div>
          {actions !== undefined ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </CardHeader>
        <CardContent className={cn('pt-2', contentClassName)}>{children}</CardContent>
      </Card>
    </section>
  );
}
