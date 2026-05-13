import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { Kbd } from '@/components/primitives/Kbd';
import { Section } from './_shared/Section';
import { EMPLOYEES, INVOICES, ORDERS, PROJECTS } from './_shared/data';
import type { Employee, Invoice, Order, Project } from './_shared/model';
import {
  employeeStatusVariant,
  formatDateShort,
  formatMoney,
  invoiceStatusVariant,
  orderStatusVariant,
  projectStatusVariant,
} from './_shared/format';

export function TableSortingPage() {
  const { t } = useTranslation();
  const employees = useMemo(() => EMPLOYEES.slice(0, 60), []);
  const orders = useMemo(() => ORDERS.slice(0, 60), []);
  const projects = useMemo(() => PROJECTS, []);
  const invoices = useMemo(() => INVOICES.slice(0, 30), []);

  const employeeColumns = useMemo<ColumnDef<Employee, unknown>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'department', header: 'Department' },
      { accessorKey: 'role', header: 'Role' },
      {
        accessorKey: 'startDate',
        header: 'Started',
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground-muted">
            {formatDateShort(row.original.startDate)}
          </span>
        ),
        sortingFn: (a, b) =>
          a.original.startDate.getTime() - b.original.startDate.getTime(),
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMoney(row.original.salary, 'USD')}</span>
        ),
      },
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

  // For "custom sort fn" demo: total stored as number but the formatted column
  // is currency-specific; we sort numerically so $1,000 USD and €1,000 EUR
  // compare by magnitude even though they're different currencies.
  const orderColumns = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      { accessorKey: 'orderNumber', header: 'Order' },
      { accessorKey: 'customerName', header: 'Customer' },
      {
        accessorKey: 'total',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMoney(row.original.total, row.original.currency)}</span>
        ),
        sortingFn: (a, b) => a.original.total - b.original.total,
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
        sortingFn: (a, b) => a.original.placedAt.getTime() - b.original.placedAt.getTime(),
      },
    ],
    [],
  );

  const projectColumns = useMemo<ColumnDef<Project, unknown>[]>(
    () => [
      {
        id: 'avatar',
        header: '',
        enableSorting: false,
        size: 32,
        cell: ({ row }) => (
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            {row.original.name[0]}
          </span>
        ),
      },
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
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) => <span className="tabular-nums">{row.original.progress}%</span>,
      },
      {
        id: '__actions__',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: () => <span aria-hidden="true">…</span>,
      },
    ],
    [],
  );

  const invoiceColumns = useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      { accessorKey: 'number', header: 'Invoice' },
      { accessorKey: 'vendor', header: 'Vendor' },
      {
        accessorKey: 'dueAt',
        header: 'Due',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatDateShort(row.original.dueAt)}</span>
        ),
        sortingFn: (a, b) => a.original.dueAt.getTime() - b.original.dueAt.getTime(),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMoney(row.original.amount, row.original.currency)}</span>
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
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('tables.sorting.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('tables.sorting.subtitle')}</p>
      </header>

      <Section
        eyebrow="One axis"
        title="Single-column sort"
        description="Click any header to cycle asc → desc → unsorted. Arrow indicator and aria-sort track the state."
      >
        <DataTable
          columns={employeeColumns}
          data={employees}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Multi"
        title="Multi-column sort"
        description={
          <span>
            Click to set the primary sort, then <Kbd>Shift</Kbd>+click another header to add a
            secondary. The numbered badge after each arrow shows priority.
          </span>
        }
      >
        <DataTable
          columns={employeeColumns}
          data={employees}
          enableMultiSort
          defaultSorting={[
            { id: 'department', desc: false },
            { id: 'salary', desc: true },
          ]}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Custom sortFn"
        title="Currency-aware total sort"
        description="The displayed value is currency-formatted (USD / EUR), but the sort is purely numeric on row.original.total so a string sort doesn't sneak in."
      >
        <DataTable
          columns={orderColumns}
          data={orders}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Selective"
        title="Non-sortable columns"
        description="Avatar and Actions columns set enableSorting: false; the rest behave normally."
      >
        <DataTable
          columns={projectColumns}
          data={projects}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>

      <Section
        eyebrow="Initial state"
        title="Default sort: most overdue first"
        description="defaultSorting=[{ id: 'dueAt', desc: false }] surfaces the most-imminent invoices on mount."
      >
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          defaultSorting={[{ id: 'dueAt', desc: false }]}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
        />
      </Section>
    </div>
  );
}
