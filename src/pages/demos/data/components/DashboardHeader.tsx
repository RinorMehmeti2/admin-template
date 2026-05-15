import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';

export function DashboardHeader() {
  return (
    <SimsPageHeader
      title="Dashboard"
      description="Overview of revenue, users, and activity over the last 30 days."
      actions={
        <>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Export CSV
          </Button>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New report
          </Button>
        </>
      }
    />
  );
}
