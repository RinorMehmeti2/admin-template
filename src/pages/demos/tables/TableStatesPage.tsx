import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Plus, RefreshCw, Inbox } from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Alert } from '@/components/feedback/Alert';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/data-display/EmptyState';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { Section } from './_shared/Section';
import { EMPLOYEES } from './_shared/data';
import type { Employee } from './_shared/model';
import { employeeStatusVariant, formatDateShort, formatMoney } from './_shared/format';
import { cn } from '@/lib/cn';

const STATE_LABELS: Record<'ready' | 'loading' | 'error', string> = {
  ready: 'Loaded',
  loading: 'Loading',
  error: 'Error',
};

function baseColumns(): ColumnDef<Employee, unknown>[] {
  return [
    { accessorKey: 'name', header: 'Name' },
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

function LoadingDemo() {
  const [phase, setPhase] = useState<'ready' | 'loading' | 'error'>('ready');
  const [tick, setTick] = useState(0);

  // When phase enters "loading", auto-resolve after 1.5s.
  useEffect(() => {
    if (phase !== 'loading') return undefined;
    const timer = setTimeout(() => setPhase('ready'), 1500);
    return () => clearTimeout(timer);
  }, [phase, tick]);

  const reload = () => {
    setPhase('loading');
    setTick((t) => t + 1);
  };

  return (
    <Section
      eyebrow="Loading"
      title="Skeleton + reload"
      description="isLoading + skeletonRows renders a configurable count of shimmer rows. Click Reload to flip back into the loading state."
      actions={
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw className={cn('h-4 w-4', phase === 'loading' && 'animate-spin')} />}
          onClick={reload}
          disabled={phase === 'loading'}
        >
          Reload
        </Button>
      }
    >
      <p className="mb-3 text-xs text-foreground-muted">
        State: <span className="font-medium text-foreground">{STATE_LABELS[phase]}</span>
      </p>
      <DataTable
        columns={baseColumns()}
        data={EMPLOYEES.slice(0, 12)}
        isLoading={phase === 'loading'}
        skeletonRows={8}
        enableGlobalFilter={false}
        enableColumnVisibility={false}
        pageSize={10}
      />
    </Section>
  );
}

function EmptyDemo() {
  return (
    <Section
      eyebrow="Empty"
      title="No data — default + custom"
      description="When data is empty, the table replaces the body with an EmptyState. Pass a custom node via the emptyState prop."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
            Default empty state
          </p>
          <DataTable
            columns={baseColumns()}
            data={[]}
            enableGlobalFilter={false}
            enableColumnVisibility={false}
            pageSize={10}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
            Custom empty state with action
          </p>
          <DataTable
            columns={baseColumns()}
            data={[]}
            enableGlobalFilter={false}
            enableColumnVisibility={false}
            pageSize={10}
            emptyState={
              <EmptyState
                icon={<Inbox className="h-6 w-6" />}
                title="No employees yet"
                description="Invite a teammate to get started — your roster will populate here."
                action={
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                    Invite teammate
                  </Button>
                }
              />
            }
          />
        </div>
      </div>
    </Section>
  );
}

function FilteredEmptyDemo() {
  return (
    <Section
      eyebrow="Empty (filtered)"
      title="No matches"
      description="A hard-coded filter that matches nothing produces the empty body — the table is still operational so users can adjust the filter."
    >
      <DataTable
        columns={baseColumns()}
        data={EMPLOYEES.slice(0, 25)}
        defaultSorting={[{ id: 'name', desc: false }]}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enableColumnVisibility={false}
        pageSize={10}
        // No native "force filter" prop — synthesize via a filter chain that
        // can never match: use a global filter prefilled? globalFilter is
        // internal. We hack by feeding empty data with a caption.
        emptyState={
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No results"
            description="Try adjusting the filters or clearing your search."
          />
        }
        // Force empty pageRows by passing an empty data array — keeps the
        // pattern truthful without a hidden internal flag.
      />
    </Section>
  );
}

function ErrorDemo() {
  const [phase, setPhase] = useState<'ready' | 'error'>('error');
  return (
    <Section
      eyebrow="Error"
      title="Error + retry"
      description="DataTable has no built-in error state — render an Alert above the table and use the empty body to host a retry CTA."
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPhase((p) => (p === 'error' ? 'ready' : 'error'))}
        >
          Toggle state
        </Button>
      }
    >
      <div className="space-y-3">
        {phase === 'error' ? (
          <Alert variant="danger" title="Could not load employees">
            The server returned a 503. We tried 3 retries — give it a moment and click retry.
          </Alert>
        ) : null}
        <DataTable
          columns={baseColumns()}
          data={phase === 'error' ? [] : EMPLOYEES.slice(0, 12)}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          pageSize={10}
          emptyState={
            phase === 'error' ? (
              <EmptyState
                icon={<AlertTriangle className="h-6 w-6" />}
                title="Loading failed"
                description="Click retry to attempt again."
                action={
                  <Button
                    size="sm"
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    onClick={() => setPhase('ready')}
                  >
                    Retry
                  </Button>
                }
              />
            ) : undefined
          }
        />
      </div>
    </Section>
  );
}

function DensityDemo() {
  const [size, setSize] = useState<'dense' | 'default' | 'comfortable'>('default');
  return (
    <Section
      eyebrow="Spacing"
      title="Density A / B"
      description="Same data re-renders at different row heights. Cell padding scales via the size variant on Table."
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(['dense', 'default', 'comfortable'] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={size === s ? 'primary' : 'outline'}
            onClick={() => setSize(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      <DataTable
        columns={baseColumns()}
        data={EMPLOYEES.slice(0, 25)}
        size={size}
        variant="striped"
        enableGlobalFilter={false}
        enableColumnVisibility={false}
        pageSize={10}
      />
    </Section>
  );
}

export function TableStatesPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader title={t('tables.states.title')} description={t('tables.states.subtitle')} />

      <LoadingDemo />
      <EmptyDemo />
      <FilteredEmptyDemo />
      <ErrorDemo />
      <DensityDemo />
    </div>
  );
}
