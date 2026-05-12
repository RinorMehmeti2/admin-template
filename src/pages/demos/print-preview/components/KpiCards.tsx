import { Activity, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
import { formatUsd } from '../data';

export function KpiCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card variant="outlined">
        <CardContent>
          <Stat
            label="Active users"
            value="2,418"
            delta="+12%"
            deltaLabel="vs last month"
            icon={<Users className="h-4 w-4" />}
          />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stat
            label="Revenue"
            value={formatUsd(47_200)}
            delta="+4.1%"
            deltaLabel="vs last month"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stat
            label="Conversion"
            value="3.4%"
            delta="-0.2%"
            deltaLabel="vs last month"
            icon={<TrendingDown className="h-4 w-4" />}
          />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stat
            label="Errors"
            value="0.07%"
            delta="-0.01%"
            deltaLabel="vs last month"
            icon={<Activity className="h-4 w-4" />}
          />
        </CardContent>
      </Card>
    </section>
  );
}
