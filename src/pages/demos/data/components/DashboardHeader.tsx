import { Plus } from 'lucide-react';
import { Button } from '@/components/primitives/Button';

export function DashboardHeader() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-foreground-muted">
          Overview of revenue, users, and activity over the last 30 days.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">Export CSV</Button>
        <Button leftIcon={<Plus className="h-4 w-4" />}>New report</Button>
      </div>
    </header>
  );
}
