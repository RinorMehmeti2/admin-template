import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Inbox,
  Package,
  Plus,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  List,
  ListItem,
  Stat,
} from '@/components/data-display';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Separator } from '@/components/primitives/Separator';

const KPIS = [
  {
    label: 'Revenue',
    value: '$48,210',
    delta: 12.4,
    deltaLabel: 'vs previous 30 days',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: 'Active users',
    value: '2,140',
    delta: -3.1,
    deltaLabel: 'vs previous 30 days',
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: 'Orders',
    value: '148',
    delta: 6.8,
    deltaLabel: 'vs previous 30 days',
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    label: 'Avg. order value',
    value: '$326',
    delta: 0,
    deltaLabel: 'vs previous 30 days',
    icon: <CreditCard className="h-4 w-4" />,
  },
] as const;

const ACTIVITY = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    action: 'created order #4920',
    when: '2m ago',
    badge: { variant: 'success' as const, label: 'Paid' },
  },
  {
    id: 2,
    name: 'Grace Hopper',
    email: 'grace@example.com',
    action: 'refunded order #4918',
    when: '14m ago',
    badge: { variant: 'warning' as const, label: 'Refund' },
  },
  {
    id: 3,
    name: 'Linus Torvalds',
    email: 'linus@example.com',
    action: 'updated billing details',
    when: '1h ago',
    badge: { variant: 'neutral' as const, label: 'Profile' },
  },
  {
    id: 4,
    name: 'Margaret Hamilton',
    email: 'margaret@example.com',
    action: 'created order #4915',
    when: '3h ago',
    badge: { variant: 'success' as const, label: 'Paid' },
  },
];

const QUICK_STATS = [
  { label: 'Sessions today', value: '4,820', delta: 4.1, icon: <Activity className="h-5 w-5" /> },
  { label: 'Pending orders', value: '12', delta: -2, icon: <Package className="h-5 w-5" /> },
  { label: 'New signups', value: '38', delta: 17.2, icon: <Users className="h-5 w-5" /> },
];

export function DataPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-foreground-muted">
            Overview of revenue, users, and activity over the last 30 days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button leftIcon={<Plus className="h-4 w-4" />}>New report</Button>
        </div>
      </header>

      {/* KPI grid */}
      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {KPIS.map((kpi) => (
          <Card key={kpi.label} variant="outlined" className="p-5">
            <Stat
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaLabel={kpi.deltaLabel}
              icon={kpi.icon}
            />
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Activity (spans 2) */}
        <Card variant="outlined" className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Last 4 events across your workspace</CardDescription>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <List variant="divided" className="border-t border-border">
              {ACTIVITY.map((a) => (
                <ListItem
                  key={a.id}
                  leading={<Avatar name={a.name} size="sm" />}
                  primary={
                    <span>
                      <span className="font-semibold">{a.name}</span>{' '}
                      <span className="font-normal text-foreground-muted">{a.action}</span>
                    </span>
                  }
                  secondary={a.email}
                  trailing={
                    <>
                      <Badge variant={a.badge.variant} size="sm">
                        {a.badge.label}
                      </Badge>
                      <span className="text-xs text-foreground-subtle">{a.when}</span>
                    </>
                  }
                />
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Side stats */}
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Live snapshot</CardTitle>
            <CardDescription>Real-time pulse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {QUICK_STATS.map((s, i) => (
              <div key={s.label}>
                <Stat
                  variant="compact"
                  label={s.label}
                  value={s.value}
                  delta={s.delta}
                  icon={s.icon}
                />
                {i < QUICK_STATS.length - 1 ? <Separator className="mt-3" /> : null}
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-foreground-subtle">Updated just now</span>
            <Button variant="link" size="sm">
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Card variants demo */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Card variants</CardTitle>
            <CardDescription>default, outlined, elevated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(['default', 'outlined', 'elevated'] as const).map((v) => (
                <Card key={v} variant={v} className="p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                    {v}
                  </p>
                  <p className="mt-1 text-sm">Body</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* EmptyState demo */}
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>EmptyState</CardTitle>
            <CardDescription>Used when a list, table, or section has nothing to show</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No invoices yet"
              description="Create your first invoice or import a CSV from your previous tool."
              action={
                <>
                  <Button variant="outline">Import CSV</Button>
                  <Button leftIcon={<Plus className="h-4 w-4" />}>New invoice</Button>
                </>
              }
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
