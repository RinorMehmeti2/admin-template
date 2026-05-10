import { Activity, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { Card } from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
import {
  BarChart,
  ChartContainer,
  DonutChart,
  LineChart,
} from '@/components/data-display/charts';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Badge } from '@/components/primitives/Badge';

interface OrderRow {
  id: string;
  customer: string;
  channel: 'Direct' | 'Search' | 'Social' | 'Email' | 'Referral';
  status: 'Paid' | 'Refunded' | 'Pending';
  amount: number;
  createdAt: string;
}

const monthly = [
  { month: 'Jan', revenue: 42_000, orders: 320 },
  { month: 'Feb', revenue: 51_000, orders: 380 },
  { month: 'Mar', revenue: 62_000, orders: 470 },
  { month: 'Apr', revenue: 58_000, orders: 440 },
  { month: 'May', revenue: 71_000, orders: 530 },
  { month: 'Jun', revenue: 78_000, orders: 590 },
  { month: 'Jul', revenue: 84_000, orders: 640 },
  { month: 'Aug', revenue: 92_000, orders: 700 },
  { month: 'Sep', revenue: 97_000, orders: 740 },
  { month: 'Oct', revenue: 105_000, orders: 810 },
  { month: 'Nov', revenue: 112_000, orders: 870 },
  { month: 'Dec', revenue: 121_000, orders: 940 },
];

const traffic = [
  { source: 'Direct', visits: 4200 },
  { source: 'Search', visits: 5100 },
  { source: 'Social', visits: 2400 },
  { source: 'Email', visits: 1800 },
  { source: 'Referral', visits: 1100 },
];

const planMix = [
  { name: 'Pro', value: 4200, color: 'primary' as const },
  { name: 'Team', value: 5100, color: 'success' as const },
  { name: 'Free', value: 2400, color: 'warning' as const },
  { name: 'Enterprise', value: 800, color: 'info' as const },
];

const orders: ReadonlyArray<OrderRow> = [
  { id: 'o-1042', customer: 'Acme Corp', channel: 'Direct', status: 'Paid', amount: 1290, createdAt: '2026-05-09' },
  { id: 'o-1041', customer: 'Globex', channel: 'Search', status: 'Paid', amount: 459, createdAt: '2026-05-09' },
  { id: 'o-1040', customer: 'Initech', channel: 'Social', status: 'Pending', amount: 199, createdAt: '2026-05-08' },
  { id: 'o-1039', customer: 'Hooli', channel: 'Email', status: 'Paid', amount: 2_499, createdAt: '2026-05-08' },
  { id: 'o-1038', customer: 'Soylent', channel: 'Direct', status: 'Refunded', amount: 89, createdAt: '2026-05-07' },
  { id: 'o-1037', customer: 'Pied Piper', channel: 'Referral', status: 'Paid', amount: 749, createdAt: '2026-05-07' },
  { id: 'o-1036', customer: 'Stark Industries', channel: 'Search', status: 'Paid', amount: 3_120, createdAt: '2026-05-06' },
  { id: 'o-1035', customer: 'Wayne Enterprises', channel: 'Direct', status: 'Paid', amount: 920, createdAt: '2026-05-06' },
];

const fmtUSD = (n: number): string =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

function statusVariant(s: OrderRow['status']): 'success' | 'danger' | 'warning' {
  if (s === 'Paid') return 'success';
  if (s === 'Refunded') return 'danger';
  return 'warning';
}

export function ChartsPage() {
  const totalSubscribers = planMix.reduce((sum, p) => sum + p.value, 0);

  const columns: ReadonlyArray<ColumnDef<OrderRow>> = [
    { id: 'id', header: 'Order', accessorKey: 'id' },
    { id: 'customer', header: 'Customer', accessorKey: 'customer' },
    { id: 'channel', header: 'Channel', accessorKey: 'channel' },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => (
        <span className="tabular-nums">${row.original.amount.toLocaleString()}</span>
      ),
    },
    { id: 'createdAt', header: 'Date', accessorKey: 'createdAt' },
  ];

  return (
    <ChartContainer className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Charts</h1>
        <p className="mt-1 text-foreground-muted">
          Recharts wrapped in our visual language. Tokens drive every colour; toggle the legend
          chips below each chart to hide a series.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <Stat
            icon={<DollarSign className="h-5 w-5" />}
            label="Revenue (YTD)"
            value="$973k"
            delta={12.4}
            deltaLabel="vs. last year"
          />
        </Card>
        <Card className="p-5">
          <Stat
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Orders"
            value="7,431"
            delta={8.1}
            deltaLabel="vs. last year"
          />
        </Card>
        <Card className="p-5">
          <Stat
            icon={<Users className="h-5 w-5" />}
            label="Active subscribers"
            value={totalSubscribers.toLocaleString()}
            delta={3.2}
            deltaLabel="this month"
          />
        </Card>
        <Card className="p-5">
          <Stat
            icon={<Activity className="h-5 w-5" />}
            label="Conversion rate"
            value="3.84%"
            delta={-0.4}
            deltaLabel="vs. last month"
          />
        </Card>
      </section>

      <section className="space-y-2">
        <header className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Revenue & order volume</h2>
          <p className="text-xs text-foreground-muted">Trailing 12 months</p>
        </header>
        <Card className="p-4">
          <LineChart
            xKey="month"
            data={monthly}
            yFormatter={fmtUSD}
            series={[
              { key: 'revenue', label: 'Revenue', color: 'primary' },
              { key: 'orders', label: 'Orders', color: 'success' },
            ]}
            height={320}
          />
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Traffic by source</h2>
          <Card className="p-4">
            <BarChart
              xKey="source"
              data={traffic}
              series={[{ key: 'visits', label: 'Visits', color: 'info' }]}
              height={280}
            />
          </Card>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Plan mix</h2>
          <Card className="p-4">
            <DonutChart
              xKey="name"
              data={planMix}
              series={[{ key: 'value', label: 'Subscribers' }]}
              height={280}
              centerLabel={{ value: totalSubscribers.toLocaleString(), sub: 'subscribers' }}
            />
          </Card>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Recent orders</h2>
        <Card className="overflow-hidden p-0">
          <DataTable<OrderRow>
            data={[...orders]}
            columns={[...columns]}
            getRowId={(r) => r.id}
          />
        </Card>
      </section>
    </ChartContainer>
  );
}
