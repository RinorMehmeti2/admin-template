import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { BarChart } from '@/components/data-display/charts/BarChart';
import { LineChart } from '@/components/data-display/charts/LineChart';
import { REVENUE_BY_MONTH, SIGNUPS, formatUsd } from '../data';

export function ChartsRow() {
  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-2">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Revenue vs expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={REVENUE_BY_MONTH}
            xKey="month"
            series={[
              { key: 'revenue', label: 'Revenue', color: 'primary' },
              { key: 'expenses', label: 'Expenses', color: 'warning' },
            ]}
            yFormatter={formatUsd}
            height={260}
          />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Daily signups</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={SIGNUPS}
            xKey="day"
            series={[{ key: 'signups', label: 'Signups', color: 'success' }]}
            height={260}
          />
        </CardContent>
      </Card>
    </section>
  );
}
