import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/data-display/Card';
import { Progress } from '@/components/feedback/Progress';
import { IconButton } from '@/components/primitives/IconButton';
import { Badge } from '@/components/primitives/Badge';
import { BounceIn, PulseRing, Stagger } from '@/components/motion';

interface Oven {
  id: string;
  name: string;
  item: string;
  start: number;
  duration: number;
}

const OVENS: ReadonlyArray<Oven> = [
  { id: 'A', name: 'Oven A', item: 'Classic croissant', start: 0, duration: 32 },
  { id: 'B', name: 'Oven B', item: 'Pain au chocolat', start: 6, duration: 38 },
  { id: 'C', name: 'Oven C', item: 'Almond croissant', start: 12, duration: 42 },
  { id: 'D', name: 'Oven D', item: 'Sourdough', start: 2, duration: 50 },
];

interface OvenBoardProps {
  className?: string;
}

export function OvenBoard({ className }: OvenBoardProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState<number>(() => (Date.now() / 1000) | 0);

  useEffect(() => {
    const id = window.setInterval(() => setNow((Date.now() / 1000) | 0), 2000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Stagger
      animation="bounce-in"
      stagger={70}
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}
    >
      {OVENS.map((o) => {
        const elapsed = ((now + o.start) % o.duration) + 1;
        const pct = Math.min(100, Math.round((elapsed / o.duration) * 100));
        const eta = Math.max(0, o.duration - elapsed);
        const almostDone = pct >= 80;
        const variant: 'default' | 'success' | 'warning' = almostDone
          ? 'success'
          : pct < 30
            ? 'warning'
            : 'default';
        return (
          <BounceIn key={o.id}>
            <Card
              variant="outlined"
              className={cn('relative transition-shadow', almostDone && 'ring-2 ring-success/40')}
            >
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      {o.name}
                    </p>
                    <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {o.item}
                    </h3>
                  </div>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-md',
                      almostDone ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
                    )}
                  >
                    <Flame className="h-4 w-4" />
                  </span>
                </div>

                <Progress
                  value={pct}
                  variant={variant}
                  label={`${o.name} ${t('croissant.bakery.oven.progressLabel')}`}
                />

                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span className="inline-flex items-center gap-1.5">
                    {almostDone ? (
                      <span data-print="hide" className="inline-flex">
                        <PulseRing size="sm" color="success" />
                      </span>
                    ) : null}
                    <span className="tabular-nums">
                      {t('croissant.bakery.oven.eta', { mins: eta })}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Badge variant={almostDone ? 'success' : 'warning'} size="sm">
                      {pct}%
                    </Badge>
                    <IconButton
                      aria-label={t('croissant.bakery.oven.open', { name: o.name })}
                      variant="ghost"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </IconButton>
                  </span>
                </div>
              </CardContent>
            </Card>
          </BounceIn>
        );
      })}
    </Stagger>
  );
}
