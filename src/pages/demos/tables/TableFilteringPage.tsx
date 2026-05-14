import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { Section } from './_shared/Section';
import { DEPLOYMENTS, EMPLOYEE_DEPARTMENTS, EMPLOYEES, INVOICES } from './_shared/data';
import type { Deployment, Employee, Invoice } from './_shared/model';
import {
  deploymentStatusVariant,
  employeeStatusVariant,
  formatDateShort,
  formatDuration,
  formatMoney,
  invoiceStatusVariant,
} from './_shared/format';

const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'on-leave', label: 'on-leave' },
  { value: 'terminated', label: 'terminated' },
];

const DEPARTMENT_OPTIONS = EMPLOYEE_DEPARTMENTS.map((d) => ({ value: d, label: d }));

function baseEmployeeColumns(): ColumnDef<Employee, unknown>[] {
  return [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
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
      accessorKey: 'startDate',
      header: 'Started',
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground-muted">
          {formatDateShort(row.original.startDate)}
        </span>
      ),
      sortingFn: (a, b) => a.original.startDate.getTime() - b.original.startDate.getTime(),
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      cell: ({ row }) => (
        <span className="tabular-nums">{formatMoney(row.original.salary, 'USD')}</span>
      ),
    },
  ];
}

export function TableFilteringPage() {
  const { t } = useTranslation();
  const employees = useMemo(() => EMPLOYEES.slice(0, 80), []);
  const invoices = useMemo(() => INVOICES, []);
  const deployments = useMemo(() => DEPLOYMENTS, []);

  // Global search only
  const globalOnly = useMemo(() => baseEmployeeColumns(), []);
  // Per-column text filters
  const textFilter = useMemo(() => baseEmployeeColumns(), []);
  // Faceted multi-select
  const facetedColumns = useMemo<ColumnDef<Employee, unknown>[]>(() => {
    const cols = baseEmployeeColumns();
    cols[2] = {
      ...cols[2]!,
      meta: { filterVariant: 'multi-select', filterOptions: DEPARTMENT_OPTIONS },
    };
    cols[4] = {
      ...cols[4]!,
      meta: { filterVariant: 'multi-select', filterOptions: EMPLOYEE_STATUS_OPTIONS },
    };
    return cols;
  }, []);

  const invoiceColumns = useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      { accessorKey: 'number', header: 'Invoice' },
      { accessorKey: 'vendor', header: 'Vendor' },
      {
        accessorKey: 'issuedAt',
        header: 'Issued',
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground-muted">
            {formatDateShort(row.original.issuedAt)}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatMoney(row.original.amount, row.original.currency)}
          </span>
        ),
        meta: { filterVariant: 'range' },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={invoiceStatusVariant(row.original.status)} dot size="sm">
            {row.original.status}
          </Badge>
        ),
        meta: {
          filterVariant: 'multi-select',
          filterOptions: [
            { value: 'draft', label: 'draft' },
            { value: 'sent', label: 'sent' },
            { value: 'paid', label: 'paid' },
            { value: 'overdue', label: 'overdue' },
            { value: 'void', label: 'void' },
          ],
        },
      },
    ],
    [],
  );

  const deploymentColumns = useMemo<ColumnDef<Deployment, unknown>[]>(
    () => [
      {
        accessorKey: 'commit',
        header: 'Commit',
        cell: ({ row }) => (
          <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground-muted">
            {row.original.commit.slice(0, 7)}
          </code>
        ),
      },
      { accessorKey: 'branch', header: 'Branch' },
      {
        accessorKey: 'environment',
        header: 'Env',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={deploymentStatusVariant(row.original.status)} dot size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'durationMs',
        header: 'Duration',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatDuration(row.original.durationMs)}</span>
        ),
      },
      {
        accessorKey: 'deployedAt',
        header: 'Deployed',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatDateShort(row.original.deployedAt)}</span>
        ),
        meta: { filterVariant: 'date-range' },
      },
    ],
    [],
  );

  const combinedColumns = useMemo<ColumnDef<Employee, unknown>[]>(() => {
    const cols = facetedColumns.map((c) => ({ ...c }));
    cols[5] = { ...cols[5]!, meta: { filterVariant: 'date-range' } };
    cols[6] = { ...cols[6]!, meta: { filterVariant: 'range' } };
    return cols;
  }, [facetedColumns]);

  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('tables.filtering.title')}
        description={t('tables.filtering.subtitle')}
      />

      <Section
        eyebrow="Global"
        title="Global search"
        description="One input narrows across every accessor. enableColumnFilters=false; no per-column inputs."
      >
        <DataTable
          columns={globalOnly}
          data={employees}
          enableGlobalFilter
          enableColumnFilters={false}
          enableColumnVisibility={false}
          pageSize={8}
        />
      </Section>

      <Section
        eyebrow="Per column"
        title="Per-column text filters"
        description="A free-text Input per visible column. Use with global search for layered narrowing."
      >
        <DataTable
          columns={textFilter}
          data={employees}
          enableGlobalFilter={false}
          enableColumnFilters
          enableColumnVisibility={false}
          pageSize={8}
        />
      </Section>

      <Section
        eyebrow="Faceted"
        title="Multi-select facets"
        description={
          <>
            meta.filterVariant=&apos;multi-select&apos; on Department + Status. Trigger shows count;
            chip strip above the table shows active filters with X buttons + Clear all.
          </>
        }
      >
        <DataTable
          columns={facetedColumns}
          data={employees}
          enableGlobalFilter={false}
          enableColumnFilters
          enableColumnVisibility={false}
          pageSize={8}
        />
      </Section>

      <Section
        eyebrow="Range"
        title="Numeric range"
        description="Two number inputs side-by-side. Undefined endpoints are open."
      >
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          enableGlobalFilter={false}
          enableColumnFilters
          enableColumnVisibility={false}
          pageSize={8}
        />
      </Section>

      <Section
        eyebrow="Date range"
        title="Date range"
        description="Reuses the existing <DateRangePicker> with built-in presets."
      >
        <DataTable
          columns={deploymentColumns}
          data={deployments}
          enableGlobalFilter={false}
          enableColumnFilters
          enableColumnVisibility={false}
          pageSize={8}
        />
      </Section>

      <Section
        eyebrow="Everything"
        title="Combined: global + facets + range + date range"
        description="Real admin filter bar — every input layered. Column visibility + pagination on top."
      >
        <DataTable
          columns={combinedColumns}
          data={employees}
          enableGlobalFilter
          enableColumnFilters
          enableColumnVisibility
          pageSize={10}
        />
      </Section>
    </div>
  );
}
