import { useState } from 'react';
import { Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/primitives/Button';
import { ChartsRow, InvoicesTable, KpiCards, PlanAndNotes } from './components';

export function PrintPreviewPage() {
  const [printedAt] = useState(() => new Date());

  return (
    <div className="mx-auto max-w-5xl p-8">
      <PageHeader
        title="Q2 financial summary"
        description={`Generated ${printedAt.toLocaleString()} · sample dashboard for verifying print output`}
        actions={
          <Button leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
            Print
          </Button>
        }
      />

      <p
        className="mb-6 rounded-md border border-border bg-surface-muted p-3 text-sm text-foreground-muted"
        data-print="hide"
      >
        Open the browser print preview (<kbd>Ctrl/⌘ P</kbd>) to verify: sidebar, topbar, search,
        action buttons, and pagination controls disappear; tables show every row; tabs render every
        panel; charts keep their colors and labels.
      </p>

      <KpiCards />

      <ChartsRow />

      <PlanAndNotes />

      <InvoicesTable />
    </div>
  );
}
