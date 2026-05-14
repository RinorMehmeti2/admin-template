import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  type ColumnDef,
  type ColumnPinningState,
} from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { Section } from './_shared/Section';
import { EMPLOYEES, INVOICES } from './_shared/data';
import type { Employee, Invoice } from './_shared/model';
import {
  employeeStatusVariant,
  formatDateShort,
  formatMoney,
  invoiceStatusVariant,
} from './_shared/format';

function fullEmployeeColumns(): ColumnDef<Employee, unknown>[] {
  return [
    { accessorKey: 'name', header: 'Name', size: 200 },
    { accessorKey: 'email', header: 'Email', size: 240 },
    { accessorKey: 'department', header: 'Department', size: 150 },
    { accessorKey: 'role', header: 'Role', size: 180 },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => (
        <Badge variant={employeeStatusVariant(row.original.status)} dot size="sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Started',
      size: 130,
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground-muted">
          {formatDateShort(row.original.startDate)}
        </span>
      ),
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      size: 130,
      cell: ({ row }) => (
        <span className="tabular-nums">{formatMoney(row.original.salary, 'USD')}</span>
      ),
    },
    { accessorKey: 'managerId', header: 'Reports to', size: 140 },
  ];
}

function sizedInvoiceColumns(): ColumnDef<Invoice, unknown>[] {
  return [
    { accessorKey: 'number', header: 'Invoice', size: 120 },
    { accessorKey: 'vendor', header: 'Vendor', size: 240 },
    {
      accessorKey: 'issuedAt',
      header: 'Issued',
      size: 130,
      cell: ({ row }) => (
        <span className="tabular-nums">{formatDateShort(row.original.issuedAt)}</span>
      ),
    },
    {
      accessorKey: 'dueAt',
      header: 'Due',
      size: 130,
      cell: ({ row }) => (
        <span className="tabular-nums">{formatDateShort(row.original.dueAt)}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      size: 140,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatMoney(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 110,
      cell: ({ row }) => (
        <Badge variant={invoiceStatusVariant(row.original.status)} dot size="sm">
          {row.original.status}
        </Badge>
      ),
    },
  ];
}

export function TableColumnsPage() {
  const { t } = useTranslation();
  const employees = useMemo(() => EMPLOYEES.slice(0, 40), []);
  const invoices = useMemo(() => INVOICES.slice(0, 25), []);

  /* --------------------------- 2) Pinning --------------------------------- */
  const [pinning, setPinning] = useState<ColumnPinningState>({
    left: ['name'],
    right: ['salary'],
  });

  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('tables.columns.title')}
        description={t('tables.columns.subtitle')}
      />

      <Section
        eyebrow="Visibility"
        title="Column visibility"
        description="Toggle columns from the Columns menu in the toolbar — checkbox per column. Internal columns (selection, expand) stay locked."
      >
        <DataTable
          columns={fullEmployeeColumns()}
          data={employees}
          enableColumnVisibility
          enableGlobalFilter={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Pinning"
        title="Left + right column pinning"
        description={
          <>
            enableColumnPinning + defaultColumnPinning lets you stick columns to either edge. The
            Columns menu adds Pin left / Pin right / Unpin sub-items per column. Pinned columns get
            sticky positioning with a 1px seam line.
          </>
        }
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPinning({ left: [], right: [] })}
            disabled={pinning.left?.length === 0 && pinning.right?.length === 0}
          >
            Unpin all
          </Button>
        }
      >
        <p className="mb-3 text-xs text-foreground-muted">
          Active pins: {(pinning.left ?? []).map((c) => `${c}↤`).join(', ') || '—'}{' '}
          {(pinning.right ?? []).map((c) => `↦${c}`).join(', ')}
        </p>
        <DataTable
          columns={fullEmployeeColumns()}
          data={employees}
          enableColumnPinning
          defaultColumnPinning={pinning}
          enableGlobalFilter={false}
          enableColumnVisibility
          pageSize={10}
          // Wide enough to force horizontal scroll so pinning matters.
          containerClassName="overflow-x-auto"
        />
      </Section>

      <Section
        eyebrow="Sized"
        title="Sized columns"
        description="Every column declares an explicit size; the table renders honoring those widths."
      >
        <DataTable
          columns={sizedInvoiceColumns()}
          data={invoices}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Follow-up"
        title="Column reorder via drag (planned)"
        description={
          <>
            Drag-to-reorder is on the roadmap — we already own the <code>useDrag</code> pointer
            primitive; this page will gain a drag handle in each header once the insertion-line UI
            lands. See the TODO in <code>DataTable.tsx</code>.
          </>
        }
      >
        <div className="rounded-md border border-dashed border-border bg-surface-muted/30 p-6 text-sm text-foreground-muted">
          The grip-handle + insertion-line affordance will live here. For now, use Pin left / Pin
          right to lock high-priority columns to the edges.
        </div>
      </Section>
    </div>
  );
}
