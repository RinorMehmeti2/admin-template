import {
  ActivityAndSnapshot,
  CardAndEmptyDemos,
  DashboardHeader,
  KpiGrid,
} from './components';

export function DataPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardHeader />

      {/* KPI grid */}
      <KpiGrid />

      <ActivityAndSnapshot />

      <CardAndEmptyDemos />
    </div>
  );
}
