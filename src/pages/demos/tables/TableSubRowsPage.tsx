import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import {
  DataTable,
  type ColumnDef,
  type ExpandedState,
  type Row,
} from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Stat } from '@/components/data-display/Stat';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { Section } from './_shared/Section';
import { INVOICES, ORDERS, PROJECTS } from './_shared/data';
import type { Invoice, Order, Project } from './_shared/model';
import {
  formatDateShort,
  formatMoney,
  invoiceStatusVariant,
  orderStatusVariant,
  projectStatusVariant,
} from './_shared/format';

function projectColumns(): ColumnDef<Project, unknown>[] {
  return [
    { accessorKey: 'name', header: 'Project' },
    { accessorKey: 'owner', header: 'Owner' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={projectStatusVariant(row.original.status)} dot size="sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => (
        <span className="tabular-nums">{formatMoney(row.original.budget, 'USD')}</span>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            role="progressbar"
            aria-valuenow={row.original.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress for ${row.original.name}`}
            className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-muted"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
          <span className="tabular-nums text-xs text-foreground-muted">
            {row.original.progress}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due',
      cell: ({ row }) => (
        <span className="tabular-nums">{formatDateShort(row.original.dueDate)}</span>
      ),
    },
  ];
}

function OrderItemsPanel({ row }: { row: Row<Order> }) {
  const o = row.original;
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
        Line items
      </p>
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted/60 text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Unit price</th>
              <th className="px-3 py-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((it) => (
              <tr key={it.sku} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs text-foreground-muted">{it.sku}</td>
                <td className="px-3 py-2">{it.name}</td>
                <td className="px-3 py-2 text-right tabular-nums">{it.qty}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatMoney(it.unitPrice, o.currency)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">
                  {formatMoney(it.unitPrice * it.qty, o.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceDetailPanel({ row }: { row: Row<Invoice> }) {
  const inv = row.original;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <Stat
          label={inv.vendor}
          value={formatMoney(inv.amount, inv.currency)}
          deltaLabel={
            <>
              <span>Issued </span>
              {formatDateShort(inv.issuedAt)}
              <span> · Due </span>
              <span className="font-medium">{formatDateShort(inv.dueAt)}</span>
            </>
          }
        />
        <Badge variant={invoiceStatusVariant(inv.status)} dot>
          {inv.status}
        </Badge>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
          Line items
        </p>
        <ul className="space-y-1.5 text-sm">
          {inv.lineItems.map((line, i) => (
            <li
              key={`${inv.id}-line-${i}`}
              className="flex items-baseline justify-between gap-3 border-b border-dashed border-border py-1.5 last:border-0"
            >
              <span className="text-foreground">{line.description}</span>
              <span className="tabular-nums text-foreground-muted">
                {line.qty} × {formatMoney(line.unit, inv.currency)}
              </span>
              <span className="tabular-nums font-medium">
                {formatMoney(line.amount, inv.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * The expand-all section needs to peek into the table's expanded state to
 * label its toggle. We pass a controlled `expanded` to DataTable for that
 * variant so the toolbar Button can toggle it.
 */
function ExpandAllProjectsExample({ data }: { data: Project[] }) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const allExpanded = expanded === true;

  return (
    <Section
      eyebrow="Toolbar"
      title="Expand all / Collapse all"
      description="Controlled expanded state — the toolbar Button flips the whole tree at once via expanded=true / {}."
    >
      <DataTable
        columns={projectColumns()}
        data={data}
        enableExpanding
        getSubRows={(r) => r.subProjects}
        expanded={expanded}
        onExpandedChange={setExpanded}
        enableGlobalFilter={false}
        enableColumnVisibility={false}
        toolbar={{
          left: (
            <Button
              size="sm"
              variant="outline"
              leftIcon={
                allExpanded ? (
                  <ChevronsDownUp className="h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4" />
                )
              }
              onClick={() => setExpanded(allExpanded ? {} : true)}
            >
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </Button>
          ),
        }}
        pageSize={10}
      />
    </Section>
  );
}

export function TableSubRowsPage() {
  const { t } = useTranslation();
  const projects = useMemo(() => PROJECTS, []);
  const orders = useMemo(() => ORDERS.slice(0, 25), []);
  const invoices = useMemo(() => INVOICES.slice(0, 20), []);

  const orderCols = useMemo<ColumnDef<Order, unknown>[]>(
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

  const invoiceCols = useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      { accessorKey: 'number', header: 'Invoice' },
      { accessorKey: 'vendor', header: 'Vendor' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatMoney(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'dueAt',
        header: 'Due',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatDateShort(row.original.dueAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={invoiceStatusVariant(row.original.status)} dot size="sm">
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('tables.subRows.title')}
        description={t('tables.subRows.subtitle')}
      />

      <Section
        eyebrow="Tree"
        title="Nested project sub-projects"
        description="getSubRows traverses subProjects (up to depth 3). Indent grows with row.depth × 1rem."
      >
        <DataTable
          columns={projectColumns()}
          data={projects}
          enableExpanding
          getSubRows={(r) => r.subProjects}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Custom panel"
        title="Order line items panel"
        description="renderExpandedRow draws a full-width inner table under each order row, scoped to that row's items."
      >
        <DataTable
          columns={orderCols}
          data={orders}
          enableExpanding
          renderExpandedRow={(row) => <OrderItemsPanel row={row} />}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Detail"
        title="Invoice detail panel"
        description="Two-column layout: Stat for the amount + meta on the left, line items on the right."
      >
        <DataTable
          columns={invoiceCols}
          data={invoices}
          enableExpanding
          renderExpandedRow={(row) => <InvoiceDetailPanel row={row} />}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <ExpandAllProjectsExample data={projects.slice(0, 4)} />
    </div>
  );
}
