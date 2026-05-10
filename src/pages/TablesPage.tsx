import { format } from 'date-fns';
import { Copy, Eye, MoreHorizontal, Plus, Receipt, Trash2, Users as UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display';
import { Avatar } from '@/components/primitives/Avatar';
import { AvatarGroup } from '@/components/primitives/AvatarGroup';
import { Badge } from '@/components/primitives/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/feedback/Tooltip';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Alert } from '@/components/feedback/Alert';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { LoadingBoundary, SkeletonTable } from '@/components/feedback/LoadingBoundary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { api, keys, useApiSuspenseQuery } from '@/data';

/* -------------------------------------------------------------------------- */
/*  Mock data                                                                 */
/* -------------------------------------------------------------------------- */

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  lastSeenDays: number;
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
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
  const customers = [
    'Acme Inc.',
    'Globex',
    'Initech',
    'Umbrella',
    'Soylent',
    'Hooli',
    'Pied Piper',
  ];
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
          The Table primitive plus the generic DataTable composition with sort, filter, paginate,
          select.
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

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickAssignees(self: User, pool: User[]): User[] {
  if (pool.length <= 1) return [];
  const others = pool.filter((u) => u.id !== self.id);
  const count = 2 + (hashStr(self.id) % 6); // 2..7
  const start = hashStr(self.id) % others.length;
  return Array.from({ length: Math.min(count, others.length) }).map(
    (_, i) => others[(start + i) % others.length]!,
  );
}

function makeUserColumns(allUsers: User[]): ColumnDef<User, unknown>[] {
  return [
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
      id: 'assignedTo',
      header: 'Assigned to',
      enableSorting: false,
      cell: ({ row }) => {
        const assignees = pickAssignees(row.original, allUsers);
        if (assignees.length === 0) {
          return <span className="text-xs text-foreground-muted">—</span>;
        }
        return (
          // Stop row-click bubbling so the chip/avatars don't trigger row navigation.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div onClick={(e) => e.stopPropagation()}>
            <AvatarGroup
              items={assignees.map((u) => ({ name: u.name }))}
              max={3}
              size="sm"
              aria-label={`Assigned to ${assignees.length}`}
              renderItem={(avatar, item) => (
                <Tooltip>
                  <TooltipTrigger>{avatar}</TooltipTrigger>
                  <TooltipContent side="top">{item.name ?? 'Member'}</TooltipContent>
                </Tooltip>
              )}
              onOverflowClick={() => {
                /* Could open a popover with the remaining users — see the
                 * Storybook story `WithOverflowPopover` for the wire-up. */
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'lastSeenDays',
      header: 'Last seen',
      cell: ({ row }) =>
        row.original.lastSeenDays === 0 ? 'Today' : `${row.original.lastSeenDays}d ago`,
    },
  ];
}

/*
 * --- BEFORE (kept for reference) ---------------------------------------
 * The previous version called `useApiQuery` and rendered three states by
 * hand: a render-time `isLoading` skeleton inside <DataTable>, an
 * `isError` <Alert> with a Retry button, and the resolved data path. That
 * pattern still applies — see useApiQuery in src/data and the OrdersTable
 * section below. The decision tree lives in CONTRIBUTING.md § "Data
 * fetching".
 *
 *   const { data, isLoading, isError, error, refetch } =
 *     useApiQuery<UsersResponse>(keys.users.list(filters), fetcher);
 *   if (isError) return <Alert title="Couldn't load users" … />;
 *   return <DataTable data={data?.data ?? []} isLoading={isLoading} … />;
 *
 * --- AFTER (this file) -------------------------------------------------
 * UsersTableSection renders chrome (header, action bar, ConfirmDialog) and
 * delegates the data leg to <UsersTableContent>, wrapped in
 * <LoadingBoundary fallback={<SkeletonTable />}>. The boundary catches
 * Suspense (skeleton) and ErrorBoundary (Alert) declaratively; the inner
 * component calls `useApiSuspenseQuery` and renders the resolved
 * `data` directly with no `isLoading` / `isError` branching.
 *
 * Trade-offs:
 *   - The DataTable + selection state must live inside the boundary
 *     because selection depends on resolved rows. Header chrome stays
 *     outside so the Card structure and "Invite user" button render
 *     immediately.
 *   - On refetch, the boundary suspends again unless we adopt
 *     useDeferredValue/startTransition. Acceptable for v1 — we'll add a
 *     "soft refresh" pattern when the team needs it.
 */

function UsersErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Alert
      variant="danger"
      title="Couldn't load users"
      description={error.message}
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Retry
        </Button>
      }
    />
  );
}

function UsersTableContent({
  setSelected,
  selectedCount,
  onDelete,
}: {
  setSelected: (rows: User[]) => void;
  selectedCount: number;
  onDelete: () => void;
}) {
  const filters = useMemo(() => ({ pageSize: 1000 }), []);
  /*
   * useApiSuspenseQuery: throws a Promise while loading (caught by the
   * outer LoadingBoundary's <Suspense>) and throws ApiError on failure
   * (caught by its <ErrorBoundary>). `data` is always defined here.
   */
  const { data } = useApiSuspenseQuery<UsersResponse>(keys.users.list(filters), () =>
    api<UsersResponse>('/api/users', { query: filters }),
  );
  const columns = useMemo(() => makeUserColumns(data.data), [data.data]);

  return (
    <DataTable<User>
      columns={columns}
      data={data.data}
      getRowId={(row) => row.id}
      enableRowSelection="multi"
      onRowSelectionChange={setSelected}
      searchPlaceholder="Search users by name, email…"
      pageSize={10}
      emptyState={
        <EmptyState
          icon={<UsersIcon className="h-6 w-6" />}
          title="No users yet"
          description="Invite a teammate to get started."
        />
      }
      toolbar={{
        right:
          selectedCount > 0 ? (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={onDelete}
            >
              Delete {selectedCount}
            </Button>
          ) : null,
      }}
    />
  );
}

function UsersTableSection() {
  const [selected, setSelected] = useState<User[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card variant="outlined">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Fetched from a mocked /api/users endpoint via MSW — sortable, searchable, paginated,
            selectable. Loading + error legs handled by &lt;LoadingBoundary&gt; +
            useApiSuspenseQuery.
          </CardDescription>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Invite user</Button>
      </CardHeader>
      <CardContent>
        <LoadingBoundary
          fallback={<SkeletonTable count={8} columns={4} />}
          errorFallback={(props) => <UsersErrorFallback {...props} />}
          source="route:/tables#users"
        >
          <UsersTableContent
            setSelected={setSelected}
            selectedCount={selected.length}
            onDelete={() => setConfirmOpen(true)}
          />
        </LoadingBoundary>
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
