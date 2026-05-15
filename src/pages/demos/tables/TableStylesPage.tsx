import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { Section } from './_shared/Section';
import { DEPLOYMENTS, EMPLOYEES, ORDERS } from './_shared/data';
import {
  deploymentStatusVariant,
  formatDateShort,
  formatDuration,
  formatMoney,
  orderStatusVariant,
} from './_shared/format';
import type { Deployment, Employee, Order, OrderStatus } from './_shared/model';
import { cn } from '@/lib/cn';

function deploymentColumns(): ColumnDef<Deployment, unknown>[] {
  return [
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
      cell: ({ row }) => {
        const env = row.original.environment;
        const variant = env === 'prod' ? 'primary' : env === 'staging' ? 'warning' : 'neutral';
        return (
          <Badge variant={variant} size="sm">
            {env}
          </Badge>
        );
      },
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
        <span className="tabular-nums text-foreground-muted">
          {formatDateShort(row.original.deployedAt)}
        </span>
      ),
    },
  ];
}

const ORDER_ROW_TINT: Record<OrderStatus, string> = {
  pending: 'border-l-4 border-warning bg-warning/5',
  paid: 'border-l-4 border-foreground-subtle/40 bg-surface',
  shipped: 'border-l-4 border-info bg-info/5',
  delivered: 'border-l-4 border-success bg-success/5',
  refunded: 'border-l-4 border-danger bg-danger/5',
};

function ordersColumns(): ColumnDef<Order, unknown>[] {
  return [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const tint = ORDER_ROW_TINT[row.original.status];
        return (
          <div className={cn('-mx-4 -my-2.5 px-4 py-2.5 sm:-mx-5 sm:-my-4 sm:px-5 sm:py-4', tint)}>
            <Badge variant={orderStatusVariant(row.original.status)} dot size="sm">
              {row.original.status}
            </Badge>
          </div>
        );
      },
    },
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
      accessorKey: 'placedAt',
      header: 'Placed',
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground-muted">
          {formatDateShort(row.original.placedAt)}
        </span>
      ),
    },
  ];
}

function employeesColumns(): ColumnDef<Employee, unknown>[] {
  return [
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
    },
  ];
}

function VariantBlock({
  title,
  variant,
  children,
}: {
  title: string;
  variant: 'default' | 'striped' | 'bordered';
  children: ReactNode;
}): ReactNode {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
        variant={variant}
      </p>
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

export function TableStylesPage() {
  const { t } = useTranslation();
  const deployments = useMemo(() => DEPLOYMENTS.slice(0, 6), []);
  const orders = useMemo(() => ORDERS.slice(0, 8), []);
  const employees = useMemo(() => EMPLOYEES.slice(0, 50), []);

  return (
    <div className="space-y-6">
      <SimsPageHeader title={t('tables.styles.title')} description={t('tables.styles.subtitle')} />

      <Section
        eyebrow="Visual"
        title="Variants matrix"
        description="Same data, three variants. The differences pop side-by-side."
        code={`<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
  <DataTable
    columns={deploymentColumns()}
    data={deployments}
    enableGlobalFilter={false}
    enableColumnVisibility={false}
    pageSize={6}
  />
  <DataTable
    columns={deploymentColumns()}
    data={deployments}
    variant="striped"
    enableGlobalFilter={false}
    enableColumnVisibility={false}
    pageSize={6}
  />
  <DataTable
    columns={deploymentColumns()}
    data={deployments}
    variant="bordered"
    enableGlobalFilter={false}
    enableColumnVisibility={false}
    pageSize={6}
  />
</div>`}
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <VariantBlock title="Default" variant="default">
            <DataTable
              columns={deploymentColumns()}
              data={deployments}
              enableGlobalFilter={false}
              enableColumnVisibility={false}
              pageSize={6}
            />
          </VariantBlock>
          <VariantBlock title="Striped" variant="striped">
            <DataTable
              columns={deploymentColumns()}
              data={deployments}
              variant="striped"
              enableGlobalFilter={false}
              enableColumnVisibility={false}
              pageSize={6}
            />
          </VariantBlock>
          <VariantBlock title="Bordered" variant="bordered">
            <DataTable
              columns={deploymentColumns()}
              data={deployments}
              variant="bordered"
              enableGlobalFilter={false}
              enableColumnVisibility={false}
              pageSize={6}
            />
          </VariantBlock>
        </div>
      </Section>

      <Section
        eyebrow="Spacing"
        title="Density"
        description="size=dense / default / comfortable. Token-driven padding scales with each step."
        code={`{(['dense', 'default', 'comfortable'] as const).map((s) => (
  <DataTable
    key={s}
    columns={deploymentColumns()}
    data={deployments}
    size={s}
    variant="striped"
    enableGlobalFilter={false}
    enableColumnVisibility={false}
    pageSize={6}
  />
))}`}
      >
        <div className="space-y-6">
          {(['dense', 'default', 'comfortable'] as const).map((s) => (
            <div key={s} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                size={s}
              </p>
              <DataTable
                columns={deploymentColumns()}
                data={deployments}
                size={s}
                variant="striped"
                enableGlobalFilter={false}
                enableColumnVisibility={false}
                pageSize={6}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Semantic accents"
        title="Status-tinted rows"
        description="The status cell renders a full-row tint via a -mx-/-my- bleed. Each tint uses a semantic accent token (success/warning/info/danger) so it adapts to palettes."
        code={`const ORDER_ROW_TINT: Record<OrderStatus, string> = {
  pending: 'border-l-4 border-warning bg-warning/5',
  paid: 'border-l-4 border-foreground-subtle/40 bg-surface',
  shipped: 'border-l-4 border-info bg-info/5',
  delivered: 'border-l-4 border-success bg-success/5',
  refunded: 'border-l-4 border-danger bg-danger/5',
};

// status cell bleeds via negative margins to tint the full row:
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const tint = ORDER_ROW_TINT[row.original.status];
    return (
      <div className={cn('-mx-4 -my-2.5 px-4 py-2.5 sm:-mx-5 sm:-my-4 sm:px-5 sm:py-4', tint)}>
        <Badge variant={orderStatusVariant(row.original.status)} dot size="sm">
          {row.original.status}
        </Badge>
      </div>
    );
  },
}

<DataTable
  columns={ordersColumns()}
  data={orders}
  enableGlobalFilter={false}
  enableColumnVisibility={false}
  pageSize={8}
/>`}
      >
        <DataTable
          columns={ordersColumns()}
          data={orders}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={8}
        />
      </Section>

      <Section
        eyebrow="Embed"
        title="Compact card-grid table"
        description="Bordered + dense + striped fits neatly inside a smaller card — useful for dashboards."
        code={`<div className="max-w-2xl">
  <DataTable
    columns={deploymentColumns()}
    data={deployments.slice(0, 5)}
    variant="bordered"
    size="dense"
    enableGlobalFilter={false}
    enableColumnVisibility={false}
    pageSize={5}
  />
</div>`}
      >
        <div className="max-w-2xl">
          <DataTable
            columns={deploymentColumns()}
            data={deployments.slice(0, 5)}
            variant="bordered"
            size="dense"
            enableGlobalFilter={false}
            enableColumnVisibility={false}
            pageSize={5}
          />
        </div>
      </Section>

      <Section
        eyebrow="Scroll"
        title="Sticky header + tall container"
        description="50-row dataset with stickyHeader and maxHeight — header pins as the body scrolls."
        code={`<DataTable
  columns={employeesColumns()}
  data={employees}
  stickyHeader
  maxHeight="24rem"
  variant="striped"
  enableGlobalFilter={false}
  enableColumnVisibility={false}
  pageSize={50}
/>`}
      >
        <DataTable
          columns={employeesColumns()}
          data={employees}
          stickyHeader
          maxHeight="24rem"
          variant="striped"
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={50}
        />
      </Section>
    </div>
  );
}
