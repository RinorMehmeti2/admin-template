import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type SectionTone = 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'danger';

const TONE: Record<SectionTone, string> = {
  primary: 'border-primary bg-primary/5',
  success: 'border-success bg-success/5',
  warning: 'border-warning bg-warning/5',
  info: 'border-info bg-info/5',
  secondary: 'border-secondary bg-secondary/5',
  danger: 'border-danger bg-danger/5',
};

const EYEBROW: Record<SectionTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  secondary: 'text-secondary',
  danger: 'text-danger',
};

export interface SectionHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: SectionTone;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = 'primary',
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn('rounded-md border-l-4 px-4 py-3', TONE[tone], className)}>
      <p className={cn('text-[11px] font-semibold uppercase tracking-wide', EYEBROW[tone])}>
        {eyebrow}
      </p>
      <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {description !== undefined ? (
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      ) : null}
    </header>
  );
}
