import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { FadeIn, Float, TypingDots } from '@/components/motion';
import type { SectionTone } from './SectionHeader';

const EYEBROW: Record<SectionTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  secondary: 'text-secondary',
  danger: 'text-danger',
};

const ICON: Record<SectionTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  secondary: 'text-secondary',
  danger: 'text-danger',
};

const GRADIENT: Record<SectionTone, string> = {
  primary: 'from-primary/40 via-secondary/40 to-info/40',
  success: 'from-success/40 via-info/40 to-primary/40',
  warning: 'from-warning/40 via-primary/40 to-danger/40',
  info: 'from-info/40 via-primary/40 to-secondary/40',
  secondary: 'from-secondary/40 via-info/40 to-success/40',
  danger: 'from-danger/40 via-warning/40 to-primary/40',
};

type PatternKind = 'dots' | 'grid' | 'none';

const PATTERN_STYLE: Record<PatternKind, string> = {
  dots: 'bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-foreground)_8%,transparent)_1px,transparent_0)] bg-[length:18px_18px]',
  grid: 'bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--color-foreground)_6%,transparent)_1px,transparent_1px)] bg-[length:24px_24px]',
  none: '',
};

export interface SceneHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Right-side meta row. Pass animated badge chips, stats etc. */
  meta?: ReactNode;
  tone?: SectionTone;
  pattern?: PatternKind;
  /** Show a `<TypingDots>` indicator after the description. Default true. */
  live?: boolean;
  className?: string;
}

export function SceneHeader({
  eyebrow,
  title,
  description,
  meta,
  tone = 'primary',
  pattern = 'none',
  live = true,
  className,
}: SceneHeaderProps) {
  return (
    <FadeIn delay={60}>
      <header
        data-print-block=""
        className={cn(
          'relative overflow-hidden rounded-xl border border-border bg-surface px-5 py-6 sm:px-7 sm:py-8',
          className,
        )}
      >
        {pattern !== 'none' ? (
          <div
            aria-hidden="true"
            data-print="hide"
            className={cn(
              'pointer-events-none absolute inset-0 opacity-60',
              PATTERN_STYLE[pattern],
            )}
          />
        ) : null}

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p
              className={cn('text-[11px] font-semibold uppercase tracking-[0.12em]', EYEBROW[tone])}
            >
              {eyebrow}
            </p>
            <h1 className="mt-1.5 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              <span>{title}</span>
              <Float data-print="hide" className={cn('inline-flex', ICON[tone])}>
                <Sparkles aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
              </Float>
            </h1>
            {description !== undefined ? (
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground-muted">
                <span>{description}</span>
                {live ? <TypingDots data-print="hide" color="muted" /> : null}
              </p>
            ) : null}
          </div>

          {meta !== undefined ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">{meta}</div>
          ) : null}
        </div>

        <div
          aria-hidden="true"
          data-print="hide"
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r',
            GRADIENT[tone],
          )}
        />
      </header>
    </FadeIn>
  );
}
