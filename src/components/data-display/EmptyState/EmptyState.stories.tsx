import { Inbox, Plus } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/primitives/Button';
import { Card } from '../Card';

export default { title: 'Data Display/EmptyState', component: EmptyState };

export const Basic = {
  render: () => (
    <Card variant="outlined" className="max-w-md">
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="No invoices yet"
        description="Once you create your first invoice, it will appear here."
      />
    </Card>
  ),
};

export const WithAction = {
  render: () => (
    <Card variant="outlined" className="max-w-md">
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="No invoices yet"
        description="Create your first invoice to get started."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />}>New invoice</Button>
        }
      />
    </Card>
  ),
};

export const TwoActions = {
  render: () => (
    <Card variant="outlined" className="max-w-md">
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="No invoices yet"
        description="Create one or import from a CSV."
        action={
          <>
            <Button variant="outline">Import CSV</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>New invoice</Button>
          </>
        }
      />
    </Card>
  ),
};
