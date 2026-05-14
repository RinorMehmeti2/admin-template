import type { ComponentType, ReactNode } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/data-display/Card';
import { cn } from '@/lib/cn';

export type SimsTrend = 'up' | 'down' | 'flat';

export interface SimsStatCardProps {
  Icon: ComponentType<{ className?: string }>;
  label: ReactNode;
  value: ReactNode;
  trend?: SimsTrend;
  trendValue?: ReactNode;
  className?: string;
}

const TREND_COLOR: Record<SimsTrend, string> = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-foreground-muted',
};

const TREND_ICON: Record<SimsTrend, ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export function SimsStatCard({
  Icon,
  label,
  value,
  trend,
  trendValue,
  className,
}: SimsStatCardProps) {
  const TrendIcon = trend !== undefined ? TREND_ICON[trend] : null;
  const trendColor = trend !== undefined ? TREND_COLOR[trend] : '';

  return (
    <Card variant="outlined" className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground-muted">{label}</p>
            <p className="mt-1 text-3xl font-bold leading-none text-foreground">{value}</p>
            {trend !== undefined && TrendIcon !== null ? (
              <div className="mt-2 flex items-center gap-1">
                <TrendIcon className={cn('h-4 w-4', trendColor)} />
                <span className={cn('text-xs font-semibold', trendColor)}>{trendValue}</span>
                <span className="text-xs text-foreground-muted">vs last week</span>
              </div>
            ) : null}
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
