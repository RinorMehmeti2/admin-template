import { Card } from '@/components/data-display/Card';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { orders } from '../data';
import type { OrderRow, OrderStatus } from '../model';

function statusVariant(s: OrderStatus): 'success' | 'danger' | 'warning' {
  if (s === 'Paid') return 'success';
  if (s === 'Refunded') return 'danger';
  return 'warning';
}

const columns: ReadonlyArray<ColumnDef<OrderRow>> = [
  { id: 'id', header: 'Order', accessorKey: 'id' },
  { id: 'customer', header: 'Customer', accessorKey: 'customer' },
  { id: 'channel', header: 'Channel', accessorKey: 'channel' },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
    ),
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) => (
      <span className="tabular-nums">${row.original.amount.toLocaleString()}</span>
    ),
  },
  { id: 'createdAt', header: 'Date', accessorKey: 'createdAt' },
];

export function RecentOrdersTable() {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">Recent orders</h2>
      <Card className="overflow-hidden p-0">
        <DataTable<OrderRow> data={[...orders]} columns={[...columns]} getRowId={(r) => r.id} />
      </Card>
    </section>
  );
}
