import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Download, FileDown, X } from 'lucide-react';
import { DataTable, type ColumnDef, type Row } from '@/components/data-display/DataTable';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent } from '@/components/data-display/Card';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { Section } from './_shared/Section';
import { EMPLOYEES, ORDERS } from './_shared/data';
import type { Employee, Order } from './_shared/model';
import {
  employeeStatusVariant,
  formatDateShort,
  formatMoney,
  orderStatusVariant,
} from './_shared/format';

export function TableSelectionPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const employees = useMemo(() => EMPLOYEES.slice(0, 50), []);
  const ordersPool = useMemo(() => ORDERS.slice(0, 80), []);

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
    ],
    [],
  );

  const orderColumns = useMemo<ColumnDef<Order, unknown>[]>(
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
    ],
    [],
  );

  /* -------------------- 1) single-select inspector ----------------------- */
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeEmp = useMemo(
    () => (activeId === null ? null : (employees.find((e) => e.id === activeId) ?? null)),
    [employees, activeId],
  );

  /* --------------- 2) multi-select with action bar ----------------------- */
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const bulkVisible = selectedOrders.length > 0;

  /* ---------------------- 3) disabled rows ------------------------------- */
  const empWithDisabled = useMemo(() => employees, [employees]);
  const canSelectRow = (row: Row<Employee>): boolean => row.original.status !== 'terminated';

  /* -------------- 4) cross-page selection (stable rowId) ----------------- */
  const [crossSelected, setCrossSelected] = useState<Order[]>([]);
  const crossOnThisPage = useMemo(() => crossSelected.length, [crossSelected]);

  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('tables.selection.title')}
        description={t('tables.selection.subtitle')}
      />

      <Section
        eyebrow="Single"
        title="Single-select with detail panel"
        description="enableRowSelection='single' renders a radio-style checkbox. The selected row highlights and feeds the inspector pane."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DataTable
              columns={empColumns}
              data={empWithDisabled.slice(0, 25)}
              getRowId={(r) => r.id}
              enableRowSelection="single"
              onRowSelectionChange={(rows) => setActiveId(rows[0]?.id ?? null)}
              enableGlobalFilter={false}
              enableColumnVisibility={false}
              pageSize={10}
            />
          </div>
          <Card variant="outlined" className="h-fit">
            <CardContent className="space-y-3">
              {activeEmp === null ? (
                <p className="text-sm text-foreground-muted">
                  Select a row to see its details here.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar name={activeEmp.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{activeEmp.name}</p>
                      <p className="truncate text-xs text-foreground-muted">{activeEmp.email}</p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <dt className="text-foreground-subtle">Department</dt>
                    <dd>{activeEmp.department}</dd>
                    <dt className="text-foreground-subtle">Role</dt>
                    <dd>{activeEmp.role}</dd>
                    <dt className="text-foreground-subtle">Status</dt>
                    <dd>
                      <Badge variant={employeeStatusVariant(activeEmp.status)} dot size="sm">
                        {activeEmp.status}
                      </Badge>
                    </dd>
                    <dt className="text-foreground-subtle">Started</dt>
                    <dd className="tabular-nums">{formatDateShort(activeEmp.startDate)}</dd>
                    <dt className="text-foreground-subtle">Salary</dt>
                    <dd className="tabular-nums">{formatMoney(activeEmp.salary, 'USD')}</dd>
                  </dl>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Bulk"
        title="Multi-select with action bar"
        description="When the selection set is non-empty, an action bar fades in above the table with bulk actions."
      >
        <div className="space-y-3">
          <div
            data-state={bulkVisible ? 'open' : 'closed'}
            aria-hidden={!bulkVisible}
            className={cn(
              'flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 transition-all duration-150',
              bulkVisible
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-1 opacity-0',
            )}
          >
            <span className="text-sm font-medium text-foreground">
              {selectedOrders.length} order{selectedOrders.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => toast.success(`Marked ${selectedOrders.length} as paid`)}
              >
                Mark as paid
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => toast.success(`Exported ${selectedOrders.length} orders`)}
              >
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<X className="h-4 w-4" />}
                onClick={() => setSelectedOrders([])}
              >
                Clear
              </Button>
            </div>
          </div>
          <DataTable
            columns={orderColumns}
            data={ordersPool.slice(0, 30)}
            getRowId={(r) => r.id}
            enableRowSelection="multi"
            onRowSelectionChange={setSelectedOrders}
            enableColumnVisibility={false}
            pageSize={10}
          />
        </div>
      </Section>

      <Section
        eyebrow="Predicate"
        title="Disabled rows"
        description="enableRowSelection accepts a (row) => boolean predicate. Terminated employees can't be selected."
      >
        <DataTable
          columns={empColumns}
          data={empWithDisabled}
          getRowId={(r) => r.id}
          enableRowSelection={canSelectRow}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Persistence"
        title="Cross-page selection"
        description="getRowId returns a stable id, so selection persists when paging. The count below tracks all selected rows across pages."
      >
        <div className="space-y-2">
          <p className="text-sm text-foreground-muted">
            <span className="font-medium text-foreground">{crossSelected.length}</span> selected
            across all pages
            {crossOnThisPage > 0 ? ` (${crossOnThisPage} carry over)` : ''}.
          </p>
          <DataTable
            columns={orderColumns}
            data={ordersPool}
            getRowId={(r) => r.id}
            enableRowSelection="multi"
            onRowSelectionChange={setCrossSelected}
            enableColumnVisibility={false}
            toolbar={{
              right:
                crossSelected.length > 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FileDown className="h-4 w-4" />}
                    onClick={() => toast.success(`Exported ${crossSelected.length}`)}
                  >
                    Export selected
                  </Button>
                ) : null,
            }}
            pageSize={10}
          />
        </div>
      </Section>
    </div>
  );
}
