import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/primitives/Skeleton';
import type { StatCardProps, StatCardTrend } from './StatCard.types';

const cardStyles = cva(
  'group relative flex flex-col gap-3 overflow-hidden rounded-lg text-foreground transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface',
        outlined: 'border border-border bg-surface',
        elevated: 'bg-surface-elevated shadow-md',
        accent: 'bg-primary text-primary-foreground',
      },
      size: {
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
      clickable: {
        true: 'cursor-pointer hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        false: '',
      },
    },
    compoundVariants: [{ variant: 'accent', clickable: true, class: 'hover:bg-primary/90' }],
    defaultVariants: { variant: 'outlined', size: 'md', clickable: false },
  },
);

const numberStyles = cva('font-semibold leading-none tracking-tight tabular-nums', {
  variants: {
    size: {
      sm: 'text-xl',
      md: 'text-3xl',
      lg: 'text-4xl',
    },
  },
  defaultVariants: { size: 'md' },
});

function defaultFormat(n: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(n);
}

function defaultDeltaFormat(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function classifyTrend(delta: number | undefined, override?: StatCardTrend): StatCardTrend | null {
  if (override !== undefined) return override;
  if (delta === undefined) return null;
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

const trendStyles: Record<StatCardTrend, string> = {
  up: 'text-success bg-success/10',
  down: 'text-danger bg-danger/10',
  flat: 'text-foreground-muted bg-surface-muted',
};

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useCounter(target: number, enabled: boolean): number {
  const [display, setDisplay] = useState<number>(target);
  const fromRef = useRef<number>(target);
  const rafRef = useRef<number | null>(null);

  // Snap (disabled / reduced-motion / no distance) happens inside rAF so the
  // setState is not synchronous to the effect body — avoids cascading renders
  // and the react-compiler eslint warning.
  useEffect(() => {
    const snap = !enabled || prefersReducedMotion();
    if (snap) {
      const id = requestAnimationFrame(() => {
        setDisplay(target);
        fromRef.current = target;
      });
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    const from = fromRef.current;
    const dist = target - from;
    if (dist === 0) {
      const id = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(id);
    }
    const dur = Math.min(1200, 400 + Math.min(800, Math.abs(dist) * 5));

    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / dur);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + dist * eased;
      setDisplay(next);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, enabled]);

  return display;
}

interface SparklineProps {
  data: number[];
  trend: StatCardTrend | null;
  size: 'sm' | 'md' | 'lg';
}

function MiniSparkline({ data, trend, size }: SparklineProps) {
  if (data.length < 2) return null;
  const w = size === 'sm' ? 56 : size === 'md' ? 80 : 96;
  const h = size === 'sm' ? 18 : size === 'md' ? 24 : 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  const stroke =
    trend === 'down'
      ? 'stroke-danger'
      : trend === 'up'
        ? 'stroke-success'
        : 'stroke-foreground-muted';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="shrink-0">
      <polyline
        points={pts}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={stroke}
      />
    </svg>
  );
}

export function StatCard({
  ref,
  label,
  value,
  displayValue,
  formatValue = defaultFormat,
  unit,
  delta,
  trend,
  formatDelta = defaultDeltaFormat,
  deltaLabel,
  icon,
  sparkline,
  sparklineData,
  onClick,
  variant,
  size = 'md',
  loading = false,
  animate = true,
  className,
  ...rest
}: StatCardProps & VariantProps<typeof cardStyles>) {
  const clickable = onClick !== undefined;
  const counterValue = useCounter(value, animate && displayValue === undefined);
  const resolvedTrend = classifyTrend(delta, trend);
  const TrendIcon = resolvedTrend !== null ? trendIcon[resolvedTrend] : null;
  const showSparkline =
    sparkline !== undefined || (sparklineData !== undefined && sparklineData.length >= 2);

  const interactive = clickable
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  if (loading) {
    return (
      <div
        ref={ref}
        data-print-block=""
        className={cn(cardStyles({ variant, size, clickable: false }), className)}
        {...rest}
      >
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-24" />
          {icon !== undefined ? <Skeleton className="h-6 w-6 rounded-md" /> : null}
        </div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-print-block=""
      className={cn(cardStyles({ variant, size, clickable }), className)}
      {...interactive}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-sm font-medium',
            variant === 'accent' ? 'text-primary-foreground/80' : 'text-foreground-muted',
          )}
        >
          {label}
        </p>
        {icon !== undefined ? (
          <span
            aria-hidden="true"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md',
              variant === 'accent'
                ? 'bg-primary-foreground/10 text-primary-foreground'
                : 'bg-surface-muted text-foreground-muted',
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-baseline gap-1">
          <span className={cn(numberStyles({ size }))}>
            {displayValue ?? formatValue(counterValue)}
          </span>
          {unit !== undefined ? (
            <span
              className={cn(
                'text-sm font-medium',
                variant === 'accent' ? 'text-primary-foreground/70' : 'text-foreground-muted',
              )}
            >
              {unit}
            </span>
          ) : null}
        </div>

        {showSparkline ? (
          <div className="ml-auto">
            {sparkline ??
              (sparklineData !== undefined ? (
                <MiniSparkline data={sparklineData} trend={resolvedTrend} size={size} />
              ) : null)}
          </div>
        ) : null}
      </div>

      {resolvedTrend !== null && delta !== undefined ? (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              variant === 'accent'
                ? 'bg-primary-foreground/15 text-primary-foreground'
                : trendStyles[resolvedTrend],
            )}
          >
            {TrendIcon !== null ? <TrendIcon className="h-3 w-3" aria-hidden="true" /> : null}
            <span>{formatDelta(delta)}</span>
          </span>
          {deltaLabel !== undefined ? (
            <span
              className={cn(
                'text-xs',
                variant === 'accent' ? 'text-primary-foreground/70' : 'text-foreground-subtle',
              )}
            >
              {deltaLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
