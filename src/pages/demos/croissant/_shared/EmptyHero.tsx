import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Float } from '@/components/motion';
import type { SectionTone } from './SectionHeader';

const TINT: Record<SectionTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  secondary: 'bg-secondary/10 text-secondary',
  danger: 'bg-danger/10 text-danger',
};

export interface EmptyHeroProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: SectionTone;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyHero({
  icon,
  title,
  description,
  tone = 'primary',
  primaryAction,
  secondaryAction,
  className,
}: EmptyHeroProps) {
  return (
    <EmptyState
      className={cn('py-16', className)}
      icon={
        icon !== undefined ? (
          <Float
            className={cn(
              'inline-flex h-16 w-16 items-center justify-center rounded-full',
              TINT[tone],
            )}
          >
            <span className="h-8 w-8">{icon}</span>
          </Float>
        ) : undefined
      }
      title={title}
      {...(description !== undefined ? { description } : {})}
      {...(primaryAction !== undefined || secondaryAction !== undefined
        ? {
            action: (
              <>
                {primaryAction}
                {secondaryAction}
              </>
            ),
          }
        : {})}
    />
  );
}
