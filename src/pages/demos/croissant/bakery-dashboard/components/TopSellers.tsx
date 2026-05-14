import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/data-display/Card';
import { Progress } from '@/components/feedback/Progress';

interface Seller {
  rank: number;
  name: string;
  sales: number;
}

const SELLERS: ReadonlyArray<Seller> = [
  { rank: 1, name: 'Classic croissant', sales: 412 },
  { rank: 2, name: 'Pain au chocolat', sales: 298 },
  { rank: 3, name: 'Almond croissant', sales: 221 },
  { rank: 4, name: 'Cinnamon roll', sales: 156 },
  { rank: 5, name: 'Kouign-amann', sales: 94 },
];

interface TopSellersProps {
  className?: string;
}

export function TopSellers({ className }: TopSellersProps) {
  const { t } = useTranslation();
  const max = Math.max(...SELLERS.map((s) => s.sales));

  return (
    <Card variant="outlined" className={className}>
      <CardContent>
        <ul className="space-y-2">
          {SELLERS.map((s) => (
            <li key={s.rank} className="flex items-center gap-3 rounded-md px-2 py-2">
              <span
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base font-semibold tabular-nums',
                  s.rank === 1
                    ? 'bg-warning/10 text-warning'
                    : 'bg-surface-muted text-foreground-muted',
                )}
              >
                {s.rank === 1 ? <Crown className="h-4 w-4" /> : s.rank}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                <Progress
                  value={(s.sales / max) * 100}
                  variant={s.rank === 1 ? 'warning' : 'default'}
                  size="sm"
                  label={t('croissant.bakery.sellers.shareLabel', { name: s.name })}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {s.sales}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
