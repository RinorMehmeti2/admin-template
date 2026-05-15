import { ActivityAndSnapshot, CardAndEmptyDemos, DashboardHeader, KpiGrid } from './components';

export function DataPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <DashboardHeader />
      <div className="space-y-6">
        <KpiGrid />
        <ActivityAndSnapshot />
        <CardAndEmptyDemos />
      </div>
    </div>
  );
}
