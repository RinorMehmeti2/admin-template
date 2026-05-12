import { ChartContainer } from '@/components/data-display/charts';
import {
  KpiStats,
  PlanMixChart,
  RecentOrdersTable,
  RevenueChart,
  TrafficChart,
} from './components';

export function ChartsPage() {
  return (
    <ChartContainer className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Charts</h1>
        <p className="mt-1 text-foreground-muted">
          Recharts wrapped in our visual language. Tokens drive every colour; toggle the legend
          chips below each chart to hide a series.
        </p>
      </header>

      <KpiStats />

      <RevenueChart />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TrafficChart />
        <PlanMixChart />
      </section>

      <RecentOrdersTable />
    </ChartContainer>
  );
}
