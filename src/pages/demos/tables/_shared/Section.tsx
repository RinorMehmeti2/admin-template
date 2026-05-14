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

/** SIMS-styled card chrome for all /tables/* demo sections. */
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
    <Card id={id} variant="outlined" className={cn('scroll-mt-24', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
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
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
