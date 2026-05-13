import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Edit, Eye, Mail, MoreHorizontal, PauseCircle, Trash2 } from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/navigation/ContextMenu';
import { useToast } from '@/context/ToastProvider';
import { Section } from './_shared/Section';
import { EMPLOYEES, ORDERS } from './_shared/data';
import type { Employee, Order } from './_shared/model';
import {
  employeeStatusVariant,
  formatDateShort,
  formatMoney,
  orderStatusVariant,
} from './_shared/format';

interface EmployeeMenuProps {
  employee: Employee;
  onDelete: (employee: Employee) => void;
}

function EmployeeActionsMenu({ employee, onDelete }: EmployeeMenuProps) {
  const { toast } = useToast();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton
          aria-label={`Row actions for ${employee.name}`}
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end">
        <DropdownMenuLabel>{employee.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.info(`Viewing ${employee.name}`)}>
          <Eye className="h-3.5 w-3.5" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info(`Editing ${employee.name}`)}>
          <Edit className="h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info(`Message sent to ${employee.name}`)}>
          <Mail className="h-3.5 w-3.5" />
          Send message
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-warning"
          onSelect={() => toast.info(`${employee.name} deactivated`)}
        >
          <PauseCircle className="h-3.5 w-3.5" />
          Deactivate
        </DropdownMenuItem>
        <DropdownMenuItem className="text-danger" onSelect={() => onDelete(employee)}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InlineOrderActions({ order }: { order: Order }) {
  const { toast } = useToast();
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Tooltip>
        <TooltipTrigger>
          <IconButton
            aria-label={`View ${order.orderNumber}`}
            variant="ghost"
            size="sm"
            onClick={() => toast.info(`Viewing ${order.orderNumber}`)}
          >
            <Eye className="h-4 w-4" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <IconButton
            aria-label={`Edit ${order.orderNumber}`}
            variant="ghost"
            size="sm"
            onClick={() => toast.info(`Editing ${order.orderNumber}`)}
          >
            <Edit className="h-4 w-4" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <IconButton
            aria-label={`Delete ${order.orderNumber}`}
            variant="ghost"
            size="sm"
            onClick={() => toast.info(`${order.orderNumber} deleted`)}
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function TableActionsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const employees = useMemo(() => EMPLOYEES.slice(0, 30), []);
  const orders = useMemo(() => ORDERS.slice(0, 25), []);
  const ordersForBulk = useMemo(() => ORDERS.slice(0, 25), []);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const [selectedBulk, setSelectedBulk] = useState<Order[]>([]);

  const empColumns = useMemo<ColumnDef<Employee, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
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
      { accessorKey: 'department', header: 'Department' },
      { accessorKey: 'role', header: 'Role' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={employeeStatusVariant(row.original.status)} dot size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: '__actions__',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        enablePinning: false,
        size: 56,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <EmployeeActionsMenu employee={row.original} onDelete={setPendingDelete} />
          </div>
        ),
      },
    ],
    [],
  );

  const orderColsInline = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      { accessorKey: 'orderNumber', header: 'Order' },
      { accessorKey: 'customerName', header: 'Customer' },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatMoney(row.original.total, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={orderStatusVariant(row.original.status)} dot size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: '__inline_actions__',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        enablePinning: false,
        size: 132,
        cell: ({ row }) => <InlineOrderActions order={row.original} />,
      },
    ],
    [],
  );

  const orderColsBulk = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      { accessorKey: 'orderNumber', header: 'Order' },
      { accessorKey: 'customerName', header: 'Customer' },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatMoney(row.original.total, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={orderStatusVariant(row.original.status)} dot size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'placedAt',
        header: 'Placed',
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground-muted">
            {formatDateShort(row.original.placedAt)}
          </span>
        ),
      },
      {
        id: '__actions__',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        enablePinning: false,
        size: 56,
        cell: ({ row }) => {
          const order = row.original;
          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <IconButton
                    aria-label={`Row actions for ${order.orderNumber}`}
                    variant="ghost"
                    size="sm"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom-end">
                  <DropdownMenuLabel>{order.orderNumber}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => toast.info(`Viewing ${order.orderNumber}`)}>
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => navigator.clipboard?.writeText(order.orderNumber)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-danger"
                    onSelect={() => toast.info(`Cancelled ${order.orderNumber}`)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [toast],
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('tables.actions.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('tables.actions.subtitle')}</p>
      </header>

      <Section
        eyebrow="Dropdown"
        title="Per-row dropdown menu"
        description="Last column is __actions__ — un-sortable, un-hideable, right-aligned. Each item shows a lucide icon. Destructive item opens a ConfirmDialog (variant=danger)."
      >
        <DataTable
          columns={empColumns}
          data={employees}
          getRowId={(r) => r.id}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Inline"
        title="Inline icon actions"
        description="3 IconButtons side-by-side wrapped in Tooltips — useful for dense layouts where a dropdown is overkill."
      >
        <DataTable
          columns={orderColsInline}
          data={orders}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Right-click"
        title="Context menu"
        description="Right-click any row to open the same actions via a cursor-anchored ContextMenu."
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <DataTable
              columns={orderColsInline.slice(0, -1)}
              data={orders}
              enableGlobalFilter={false}
              enableColumnVisibility={false}
              pageSize={10}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Row actions</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => toast.info('View')}>
              <Eye className="h-3.5 w-3.5" />
              View
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => toast.info('Edit')}>
              <Edit className="h-3.5 w-3.5" />
              Edit
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-danger" onSelect={() => toast.info('Deleted')}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>

      <Section
        eyebrow="Combined"
        title="Bulk + per-row actions"
        description="Selection bar appears when 1+ rows selected; per-row dropdown always works regardless of selection state."
      >
        <div className="space-y-3">
          {selectedBulk.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
              <span className="text-sm font-medium">
                {selectedBulk.length} order{selectedBulk.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`Refunded ${selectedBulk.length}`)}
                >
                  Refund all
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info(`Exported ${selectedBulk.length}`)}
                >
                  Export
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedBulk([])}>
                  Clear
                </Button>
              </div>
            </div>
          ) : null}
          <DataTable
            columns={orderColsBulk}
            data={ordersForBulk}
            getRowId={(r) => r.id}
            enableRowSelection="multi"
            onRowSelectionChange={setSelectedBulk}
            enableGlobalFilter={false}
            enableColumnVisibility={false}
            pageSize={10}
          />
        </div>
      </Section>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        variant="danger"
        title={pendingDelete === null ? 'Delete?' : `Delete ${pendingDelete.name}?`}
        description="This is a demo — no one will actually be deleted. The dialog re-uses the ConfirmDialog component."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete !== null) toast.success(`${pendingDelete.name} deleted`);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
