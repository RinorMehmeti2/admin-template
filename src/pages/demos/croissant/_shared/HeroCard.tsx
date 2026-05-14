import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/data-display/Card';
import { BlurIn, Shimmer } from '@/components/motion';
import type { SectionTone } from './SectionHeader';

const TONE_GRADIENT: Record<SectionTone, string> = {
  primary: 'from-primary/10 via-surface to-primary/5',
  success: 'from-success/10 via-surface to-success/5',
  warning: 'from-warning/10 via-surface to-warning/5',
  info: 'from-info/10 via-surface to-info/5',
  secondary: 'from-secondary/10 via-surface to-secondary/5',
  danger: 'from-danger/10 via-surface to-danger/5',
};

const TONE_RING: Record<SectionTone, string> = {
  primary: 'ring-primary/20',
  success: 'ring-success/20',
  warning: 'ring-warning/20',
  info: 'ring-info/20',
  secondary: 'ring-secondary/20',
  danger: 'ring-danger/20',
};

const TONE_EYEBROW: Record<SectionTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  secondary: 'text-secondary',
  danger: 'text-danger',
};

export interface HeroCardProps {
  tone?: SectionTone;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Right-side illustration / composition slot. */
  illustration?: ReactNode;
  /** Bottom-right action slot. */
  action?: ReactNode;
  /** Render a shimmer overlay (loading hint). Default false. */
  loading?: boolean;
  className?: string;
}

export function HeroCard({
  tone = 'primary',
  eyebrow,
  title,
  description,
  illustration,
  action,
  loading = false,
  className,
}: HeroCardProps) {
  return (
    <BlurIn>
      <Card
        variant="outlined"
        className={cn(
          'relative overflow-hidden bg-gradient-to-br ring-1',
          TONE_GRADIENT[tone],
          TONE_RING[tone],
          className,
        )}
      >
        {loading ? <Shimmer data-print="hide" className="absolute inset-0" /> : null}
        <CardContent className="relative grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0 space-y-2">
            {eyebrow !== undefined ? (
              <p
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.12em]',
                  TONE_EYEBROW[tone],
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h2>
            {description !== undefined ? (
              <p className="text-sm text-foreground-muted">{description}</p>
            ) : null}
            {action !== undefined ? <div className="pt-2">{action}</div> : null}
          </div>
          {illustration !== undefined ? (
            <div className="flex shrink-0 items-center justify-center sm:justify-end">
              {illustration}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </BlurIn>
  );
}
