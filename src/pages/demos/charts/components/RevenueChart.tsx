import { Card } from '@/components/data-display/Card';
import { LineChart } from '@/components/data-display/charts';
import { monthly } from '../data';

const fmtUSD = (n: number): string =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

export function RevenueChart() {
  return (
    <section className="space-y-2">
      <header className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Revenue & order volume</h2>
        <p className="text-xs text-foreground-muted">Trailing 12 months</p>
      </header>
      <Card className="p-4">
        <LineChart
          xKey="month"
          data={monthly}
          yFormatter={fmtUSD}
          series={[
            { key: 'revenue', label: 'Revenue', color: 'primary' },
            { key: 'orders', label: 'Orders', color: 'success' },
          ]}
          height={320}
        />
      </Card>
    </section>
  );
}
