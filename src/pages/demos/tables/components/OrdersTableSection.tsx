import { format } from 'date-fns';
import { Copy, Eye, MoreHorizontal, Receipt, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
} from '@/components/data-display';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { ORDERS } from '../data';
import type { Order } from '../model';

const orderStatusVariant: Record<Order['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  Paid: 'success',
  Pending: 'warning',
  Failed: 'danger',
  Refunded: 'neutral',
};

function OrderActionMenu({ order }: { order: Order }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton aria-label={`Actions for ${order.id}`} variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end">
        <DropdownMenuLabel>{order.id}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="h-4 w-4" />
          View invoice
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigator.clipboard?.writeText(order.id)}>
          <Copy className="h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-danger">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrdersTableSection() {
  const orderColumns = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'Invoice' },
      { accessorKey: 'customer', header: 'Customer' },
      {
        accessorKey: 'placedAt',
        header: 'Placed',
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground-muted">
            {format(row.original.placedAt, 'MMM d, yyyy')}
          </span>
        ),
        sortingFn: (a, b) => a.original.placedAt.getTime() - b.original.placedAt.getTime(),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.original.currency,
          }).format(row.original.amount);
          return <span className="tabular-nums">{formatted}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={orderStatusVariant[row.original.status]} size="sm" dot>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: '__actions__',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          // Wrapper stops row-click bubbling so the menu trigger doesn't open the row.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <OrderActionMenu order={row.original} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <Card variant="outlined">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Date, currency, status badge, and an action menu per row.
          </CardDescription>
        </div>
        <Button variant="outline" leftIcon={<Receipt className="h-4 w-4" />}>
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable<Order>
          columns={orderColumns}
          data={ORDERS}
          getRowId={(row) => row.id}
          searchPlaceholder="Search by invoice, customer…"
          pageSize={10}
          onRowClick={(row) => {
            // Demo: in a real app this would navigate to the invoice page.
            console.log('row click', row.id);
          }}
        />
      </CardContent>
    </Card>
  );
}
