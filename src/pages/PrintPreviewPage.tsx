import { useMemo, useState } from 'react';
import { Activity, Printer, TrendingDown, TrendingUp, Users } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { BarChart } from '@/components/data-display/charts/BarChart';
import { LineChart } from '@/components/data-display/charts/LineChart';
import { DonutChart } from '@/components/data-display/charts/DonutChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';

interface InvoiceRow {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issued: string;
}

const INVOICES: InvoiceRow[] = [
  { id: 'INV-1042', customer: 'Acme Corp', amount: 12_400, status: 'paid', issued: '2026-04-12' },
  { id: 'INV-1043', customer: 'Globex', amount: 3_280, status: 'paid', issued: '2026-04-15' },
  { id: 'INV-1044', customer: 'Initech', amount: 7_800, status: 'pending', issued: '2026-04-18' },
  { id: 'INV-1045', customer: 'Umbrella', amount: 1_120, status: 'overdue', issued: '2026-03-30' },
  { id: 'INV-1046', customer: 'Stark Industries', amount: 24_000, status: 'paid', issued: '2026-04-22' },
  { id: 'INV-1047', customer: 'Wayne Enterprises', amount: 9_950, status: 'pending', issued: '2026-04-25' },
  { id: 'INV-1048', customer: 'Cyberdyne', amount: 5_400, status: 'paid', issued: '2026-04-29' },
  { id: 'INV-1049', customer: 'Hooli', amount: 2_780, status: 'overdue', issued: '2026-04-02' },
  { id: 'INV-1050', customer: 'Pied Piper', amount: 6_120, status: 'pending', issued: '2026-05-01' },
  { id: 'INV-1051', customer: 'Massive Dynamic', amount: 18_300, status: 'paid', issued: '2026-05-03' },
  { id: 'INV-1052', customer: 'Soylent', amount: 4_650, status: 'paid', issued: '2026-05-04' },
  { id: 'INV-1053', customer: 'Vandelay', amount: 870, status: 'overdue', issued: '2026-04-09' },
];

const REVENUE_BY_MONTH = [
  { month: 'Jan', revenue: 32_000, expenses: 18_400 },
  { month: 'Feb', revenue: 38_500, expenses: 19_200 },
  { month: 'Mar', revenue: 41_700, expenses: 22_100 },
  { month: 'Apr', revenue: 47_200, expenses: 23_900 },
  { month: 'May', revenue: 51_900, expenses: 24_600 },
];

const SIGNUPS = [
  { day: 'Mon', signups: 84 },
  { day: 'Tue', signups: 102 },
  { day: 'Wed', signups: 96 },
  { day: 'Thu', signups: 124 },
  { day: 'Fri', signups: 138 },
  { day: 'Sat', signups: 73 },
  { day: 'Sun', signups: 61 },
];

const PLAN_BREAKDOWN = [
  { name: 'Starter', value: 412, color: 'info' as const },
  { name: 'Pro', value: 268, color: 'primary' as const },
  { name: 'Business', value: 96, color: 'success' as const },
  { name: 'Enterprise', value: 18, color: 'warning' as const },
];

const formatUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function statusVariant(status: InvoiceRow['status']): 'success' | 'warning' | 'danger' {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}

export function PrintPreviewPage() {
  const [printedAt] = useState(() => new Date());

  const columns = useMemo<ColumnDef<InvoiceRow, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'Invoice' },
      { accessorKey: 'customer', header: 'Customer' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatUsd(row.original.amount),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      { accessorKey: 'issued', header: 'Issued' },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-5xl p-8">
      <PageHeader
        title="Q2 financial summary"
        description={`Generated ${printedAt.toLocaleString()} · sample dashboard for verifying print output`}
        actions={
          <Button leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
            Print
          </Button>
        }
      />

      <p className="mb-6 rounded-md border border-border bg-surface-muted p-3 text-sm text-foreground-muted" data-print="hide">
        Open the browser print preview (<kbd>Ctrl/⌘ P</kbd>) to verify: sidebar, topbar, search, action buttons, and pagination
        controls disappear; tables show every row; tabs render every panel; charts keep their colors and labels.
      </p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="outlined">
          <CardContent>
            <Stat label="Active users" value="2,418" delta="+12%" deltaLabel="vs last month" icon={<Users className="h-4 w-4" />} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Stat label="Revenue" value={formatUsd(47_200)} delta="+4.1%" deltaLabel="vs last month" icon={<TrendingUp className="h-4 w-4" />} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Stat label="Conversion" value="3.4%" delta="-0.2%" deltaLabel="vs last month" icon={<TrendingDown className="h-4 w-4" />} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Stat label="Errors" value="0.07%" delta="-0.01%" deltaLabel="vs last month" icon={<Activity className="h-4 w-4" />} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Revenue vs expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={REVENUE_BY_MONTH}
              xKey="month"
              series={[
                { key: 'revenue', label: 'Revenue', color: 'primary' },
                { key: 'expenses', label: 'Expenses', color: 'warning' },
              ]}
              yFormatter={formatUsd}
              height={260}
            />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Daily signups</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={SIGNUPS}
              xKey="day"
              series={[{ key: 'signups', label: 'Signups', color: 'success' }]}
              height={260}
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card variant="outlined" className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Plan mix</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={PLAN_BREAKDOWN}
              xKey="name"
              series={[{ key: 'value', label: 'Customers' }]}
              height={260}
            />
          </CardContent>
        </Card>

        <Card variant="outlined" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes by department</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="finance">
              <TabsList>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="ops">Operations</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
              </TabsList>
              <TabsContent value="finance">
                <h3 className="text-sm font-semibold">Finance</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Revenue exceeded plan by 6.2%. Two overdue invoices over 30 days outstanding;
                  see <a href="https://example.com/finance/aging">aging report</a> for follow-up.
                </p>
              </TabsContent>
              <TabsContent value="ops">
                <h3 className="text-sm font-semibold">Operations</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Disk usage on prod-3 trending up; provisioning ticket{' '}
                  <a href="https://example.com/tickets/4218">OPS-4218</a> filed.
                </p>
              </TabsContent>
              <TabsContent value="sales">
                <h3 className="text-sm font-semibold">Sales</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Pipeline coverage at 3.1x for Q3. Stark Industries upgrade closed at $24k MRR.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<InvoiceRow>
              columns={columns}
              data={INVOICES}
              pageSize={5}
              enableGlobalFilter={false}
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
