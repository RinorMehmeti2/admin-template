import { ExampleBlock } from '@/components/data-display';
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

const code = `const columns: ReadonlyArray<ColumnDef<OrderRow>> = [
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
      <span className="tabular-nums">\${row.original.amount.toLocaleString()}</span>
    ),
  },
  { id: 'createdAt', header: 'Date', accessorKey: 'createdAt' },
];

<DataTable<OrderRow> data={[...orders]} columns={[...columns]} getRowId={(r) => r.id} />`;

export function RecentOrdersTable() {
  return (
    <ExampleBlock
      title="Recent orders"
      description="DataTable with status badges and formatted currency."
      code={code}
    >
      <DataTable<OrderRow> data={[...orders]} columns={[...columns]} getRowId={(r) => r.id} />
    </ExampleBlock>
  );
}
