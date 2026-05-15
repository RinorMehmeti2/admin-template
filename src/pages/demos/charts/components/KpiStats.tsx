import { Activity, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { Card } from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
import { planMix } from '../data';

export function KpiStats() {
  const totalSubscribers = planMix.reduce((sum, p) => sum + p.value, 0);

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card variant="outlined" className="p-5">
        <Stat
          icon={<DollarSign className="h-5 w-5" />}
          label="Revenue (YTD)"
          value="$973k"
          delta={12.4}
          deltaLabel="vs. last year"
        />
      </Card>
      <Card variant="outlined" className="p-5">
        <Stat
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Orders"
          value="7,431"
          delta={8.1}
          deltaLabel="vs. last year"
        />
      </Card>
      <Card variant="outlined" className="p-5">
        <Stat
          icon={<Users className="h-5 w-5" />}
          label="Active subscribers"
          value={totalSubscribers.toLocaleString()}
          delta={3.2}
          deltaLabel="this month"
        />
      </Card>
      <Card variant="outlined" className="p-5">
        <Stat
          icon={<Activity className="h-5 w-5" />}
          label="Conversion rate"
          value="3.84%"
          delta={-0.4}
          deltaLabel="vs. last month"
        />
      </Card>
    </section>
  );
}
