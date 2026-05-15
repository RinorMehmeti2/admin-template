import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/data-display';
import { cn } from '@/lib/cn';
import { KPIS } from '../data';

export function KpiGrid() {
  return (
    <section
      aria-label="Key metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {KPIS.map((kpi) => {
        const trend = kpi.delta > 0 ? 'up' : kpi.delta < 0 ? 'down' : 'flat';
        const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
        const trendColor =
          trend === 'up'
            ? 'text-success'
            : trend === 'down'
              ? 'text-danger'
              : 'text-foreground-muted';
        return (
          <Card key={kpi.label} variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground-muted">{kpi.label}</p>
                  <p className="mt-1 text-3xl font-bold leading-none text-foreground">
                    {kpi.value}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendIcon className={cn('h-4 w-4', trendColor)} />
                    <span className={cn('text-xs font-semibold', trendColor)}>
                      {kpi.delta > 0 ? '+' : ''}
                      {kpi.delta}%
                    </span>
                    <span className="text-xs text-foreground-muted">{kpi.deltaLabel}</span>
                  </div>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
