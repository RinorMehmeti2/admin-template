import { useTranslation } from 'react-i18next';
import { ChartContainer } from '@/components/data-display/charts';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  KpiStats,
  PlanMixChart,
  RecentOrdersTable,
  RevenueChart,
  TrafficChart,
} from './components';

export function ChartsPage() {
  const { t } = useTranslation();
  return (
    <ChartContainer className="mx-auto max-w-[1400px]">
      <SimsPageHeader title={t('demos.charts.title')} description={t('demos.charts.subtitle')} />
      <div className="space-y-6">
        <KpiStats />
        <RevenueChart />
        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <TrafficChart />
          <PlanMixChart />
        </section>
        <RecentOrdersTable />
      </div>
    </ChartContainer>
  );
}
