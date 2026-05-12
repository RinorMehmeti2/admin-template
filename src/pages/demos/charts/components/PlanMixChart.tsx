import { Card } from '@/components/data-display/Card';
import { DonutChart } from '@/components/data-display/charts';
import { planMix } from '../data';

export function PlanMixChart() {
  const totalSubscribers = planMix.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">Plan mix</h2>
      <Card className="p-4">
        <DonutChart
          xKey="name"
          data={planMix}
          series={[{ key: 'value', label: 'Subscribers' }]}
          height={280}
          centerLabel={{ value: totalSubscribers.toLocaleString(), sub: 'subscribers' }}
        />
      </Card>
    </div>
  );
}
