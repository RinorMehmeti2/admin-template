import { format } from 'date-fns';
import {
  Copy,
  Eye,
  MoreHorizontal,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';

/* -------------------------------------------------------------------------- */
/*  Mock data                                                                 */
/* -------------------------------------------------------------------------- */

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  lastSeenDays: number;
}

const ROLES: User['role'][] = ['Admin', 'Member', 'Viewer'];
const STATUSES: User['status'][] = ['Active', 'Invited', 'Suspended'];

function makeUsers(n: number): User[] {
  const first = ['Ada', 'Grace', 'Linus', 'Margaret', 'Alan', 'Edsger', 'Donald', 'Barbara', 'Niklaus', 'Bjarne'];
  const last = ['Lovelace', 'Hopper', 'Torvalds', 'Hamilton', 'Turing', 'Dijkstra', 'Knuth', 'Liskov', 'Wirth', 'Stroustrup'];
  return Array.from({ length: n }).map((_, i) => {
    const f = first[i % first.length]!;
    const l = last[(i * 7) % last.length]!;
    return {
      id: i + 1,
      name: `${f} ${l}`,
      email: `${f.toLowerCase()}.${l.toLowerCase()}${i + 1}@example.com`,
      role: ROLES[i % ROLES.length]!,
      status: STATUSES[i % STATUSES.length]!,
      lastSeenDays: (i * 13) % 60,
    };
  });
}

interface Order {
  id: string;
  customer: string;
  amount: number;
  currency: 'USD' | 'EUR';
  status: 'Pending' | 'Paid' | 'Refunded' | 'Failed';
  placedAt: Date;
}

function makeOrders(n: number): Order[] {
  const customers = ['Acme Inc.', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Hooli', 'Pied Piper'];
  return Array.from({ length: n }).map((_, i) => {
    const days = i * 2;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return {
      id: `INV-${String(2000 + i).padStart(5, '0')}`,
      customer: customers[i % customers.length]!,
      amount: Math.round((50 + ((i * 137) % 950)) * 100) / 100,
      currency: i % 4 === 0 ? 'EUR' : 'USD',
      status: (['Pending', 'Paid', 'Refunded', 'Failed'] as const)[i % 4]!,
      placedAt: d,
    };
  });
}

const USERS = makeUsers(50);
const ORDERS = makeOrders(40);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export function TablesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tables</h1>
        <p className="mt-1 text-foreground-muted">
          The Table primitive plus the generic DataTable composition with sort, filter, paginate, select.
        </p>
      </header>

      <SimpleTableSection />
      <UsersTableSection />
      <OrdersTableSection />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  1. Simple static Table                                                    */
/* -------------------------------------------------------------------------- */

const STATIC_PLANS = [
  { plan: 'Starter', seats: 1, price: '$0/mo', features: '1 project' },
  { plan: 'Team', seats: 10, price: '$49/mo', features: 'Unlimited projects, audit log' },
  { plan: 'Business', seats: 50, price: '$149/mo', features: 'SSO, RBAC, priority support' },
  { plan: 'Enterprise', seats: 0, price: 'Contact us', features: 'SLA, dedicated infra' },
];

function SimpleTableSection() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Simple Table</CardTitle>
        <CardDescription>Static rows. Striped variant, default size.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table variant="striped">
          <TableCaption>Pricing plans</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STATIC_PLANS.map((p) => (
              <TableRow key={p.plan}>
                <TableCell className="font-medium">{p.plan}</TableCell>
                <TableCell>{p.seats === 0 ? 'Custom' : p.seats}</TableCell>
                <TableCell>{p.price}</TableCell>
                <TableCell className="text-foreground-muted">{p.features}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  2. DataTable<User>                                                        */
/* -------------------------------------------------------------------------- */

const userStatusVariant: Record<User['status'], 'success' | 'warning' | 'danger'> = {
  Active: 'success',
  Invited: 'warning',
  Suspended: 'danger',
};

const userColumns: ColumnDef<User, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-foreground-muted">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={userStatusVariant[row.original.status]} dot size="sm">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastSeenDays',
    header: 'Last seen',
    cell: ({ row }) =>
      row.original.lastSeenDays === 0
        ? 'Today'
        : `${row.original.lastSeenDays}d ago`,
  },
];

function UsersTableSection() {
  const [selected, setSelected] = useState<User[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card variant="outlined">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Users</CardTitle>
          <CardDescription>50 mock users — sortable, searchable, paginated, selectable.</CardDescription>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Invite user</Button>
      </CardHeader>
      <CardContent>
        <DataTable<User>
          columns={userColumns}
          data={USERS}
          getRowId={(row) => String(row.id)}
          enableRowSelection="multi"
          onRowSelectionChange={setSelected}
          searchPlaceholder="Search users by name, email…"
          pageSize={10}
          toolbar={{
            right:
              selected.length > 0 ? (
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete {selected.length}
                </Button>
              ) : null,
          }}
        />
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        title={`Delete ${selected.length} user${selected.length === 1 ? '' : 's'}?`}
        description="This is a demo — no users will actually be deleted."
        confirmLabel="Delete"
        onConfirm={() => setConfirmOpen(false)}
      />
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. DataTable<Order>                                                       */
/* -------------------------------------------------------------------------- */

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
        <DropdownMenuItem
          onSelect={() => navigator.clipboard?.writeText(order.id)}
        >
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

function OrdersTableSection() {
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
        sortingFn: (a, b) =>
          a.original.placedAt.getTime() - b.original.placedAt.getTime(),
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
