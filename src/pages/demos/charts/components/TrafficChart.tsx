import { Card } from '@/components/data-display/Card';
import { BarChart } from '@/components/data-display/charts';
import { traffic } from '../data';

export function TrafficChart() {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">Traffic by source</h2>
      <Card className="p-4">
        <BarChart
          xKey="source"
          data={traffic}
          series={[{ key: 'visits', label: 'Visits', color: 'info' }]}
          height={280}
        />
      </Card>
    </div>
  );
}
