import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Coins,
  ShoppingCart,
  Receipt,
  Croissant as CroissantIcon,
  Activity,
  Flame,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { AreaChart } from '@/components/data-display/charts/AreaChart';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { useToast } from '@/context/ToastProvider';
import { PulseRing, TypingDots } from '@/components/motion';
import {
  ChartFrame,
  Chip,
  ComponentsUsedFooter,
  SceneHeader,
  StagedSection,
  StatRail,
  type StatRailItem,
} from '../_shared';
import { OvenBoard } from './components/OvenBoard';
import { TopSellers } from './components/TopSellers';

interface OrderRow {
  id: string;
  customer: string;
  items: string;
  status: 'paid' | 'pending' | 'refunded';
  total: number;
  age: number;
}

const ORDERS: ReadonlyArray<OrderRow> = [
  {
    id: '#1042',
    customer: 'Ada Lovelace',
    items: '3 × croissant, 1 × latte',
    status: 'paid',
    total: 18.5,
    age: 1,
  },
  {
    id: '#1041',
    customer: 'Grace Hopper',
    items: '6 × pain au chocolat',
    status: 'pending',
    total: 24.0,
    age: 3,
  },
  {
    id: '#1040',
    customer: 'Linus Torvalds',
    items: '2 × sourdough',
    status: 'paid',
    total: 14.0,
    age: 5,
  },
  {
    id: '#1039',
    customer: 'Margaret Hamilton',
    items: '1 × kouign-amann',
    status: 'refunded',
    total: 6.5,
    age: 7,
  },
  {
    id: '#1038',
    customer: 'Edsger Dijkstra',
    items: '4 × almond croissant',
    status: 'paid',
    total: 28.0,
    age: 9,
  },
  {
    id: '#1037',
    customer: 'Alan Turing',
    items: '2 × cinnamon roll, 1 × cappuccino',
    status: 'pending',
    total: 16.75,
    age: 12,
  },
  {
    id: '#1036',
    customer: 'Hedy Lamarr',
    items: '1 × baguette',
    status: 'paid',
    total: 4.5,
    age: 14,
  },
  {
    id: '#1035',
    customer: 'Donald Knuth',
    items: '3 × espresso',
    status: 'paid',
    total: 10.75,
    age: 18,
  },
];

type Range = 'day' | 'week' | 'month';

const REVENUE_DATA: Record<Range, Array<{ label: string; revenue: number; target: number }>> = {
  day: [
    { label: '6a', revenue: 120, target: 100 },
    { label: '8a', revenue: 320, target: 250 },
    { label: '10a', revenue: 480, target: 360 },
    { label: '12p', revenue: 520, target: 420 },
    { label: '2p', revenue: 410, target: 380 },
    { label: '4p', revenue: 350, target: 320 },
    { label: '6p', revenue: 280, target: 260 },
  ],
  week: [
    { label: 'Mon', revenue: 820, target: 700 },
    { label: 'Tue', revenue: 910, target: 700 },
    { label: 'Wed', revenue: 1180, target: 800 },
    { label: 'Thu', revenue: 980, target: 800 },
    { label: 'Fri', revenue: 1420, target: 900 },
    { label: 'Sat', revenue: 1640, target: 900 },
    { label: 'Sun', revenue: 1320, target: 900 },
  ],
  month: [
    { label: 'W1', revenue: 6420, target: 5800 },
    { label: 'W2', revenue: 7180, target: 6000 },
    { label: 'W3', revenue: 8420, target: 6500 },
    { label: 'W4', revenue: 9180, target: 7000 },
  ],
};

const COMPONENTS = [
  'SceneHeader',
  'StagedSection',
  'StatRail',
  'StatCard',
  'AreaChart',
  'ChartFrame',
  'Progress',
  'Card',
  'Badge',
  'Avatar',
  'Button',
  'IconButton',
  'DataTable',
  'PulseRing',
  'TypingDots',
  'Float',
  'BounceIn',
  'RotateIn',
  'Stagger',
];

function statusBadge(status: OrderRow['status'], t: (k: string) => string) {
  if (status === 'paid')
    return (
      <Badge variant="success" dot>
        {t('croissant.bakery.status.paid')}
      </Badge>
    );
  if (status === 'pending')
    return (
      <Badge variant="warning" dot>
        {t('croissant.bakery.status.pending')}
      </Badge>
    );
  return (
    <Badge variant="danger" dot>
      {t('croissant.bakery.status.refunded')}
    </Badge>
  );
}

export function BakeryDashboardPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [i18n.language],
  );

  const [range, setRange] = useState<Range>('week');
  const [selectedRows, setSelectedRows] = useState<OrderRow[]>([]);

  const revenueSeries = REVENUE_DATA[range];

  const insight = useMemo(() => {
    const data = revenueSeries;
    if (data.length === 0) return null;
    const best = data.reduce((a, b) => (a.revenue > b.revenue ? a : b));
    const worst = data.reduce((a, b) => (a.revenue < b.revenue ? a : b));
    return {
      best: best.label,
      bestVal: currency.format(best.revenue),
      worst: worst.label,
      worstVal: currency.format(worst.revenue),
    };
  }, [revenueSeries, currency]);

  const stats: ReadonlyArray<StatRailItem> = [
    {
      id: 'revenue',
      label: t('croissant.bakery.kpi.revenue'),
      value: 48210,
      formatValue: (n) => currency.format(n),
      delta: 12.4,
      deltaLabel: t('croissant.bakery.kpi.deltaLabel'),
      icon: <Coins className="h-4 w-4" />,
      spark: [12, 18, 14, 24, 20, 28, 32, 36, 41, 38, 44, 48],
      tone: 'warning',
    },
    {
      id: 'orders',
      label: t('croissant.bakery.kpi.orders'),
      value: 1280,
      delta: 6.2,
      deltaLabel: t('croissant.bakery.kpi.deltaLabel'),
      icon: <ShoppingCart className="h-4 w-4" />,
      spark: [42, 48, 60, 51, 72, 86, 70, 88, 92, 100, 110, 128],
      tone: 'primary',
    },
    {
      id: 'aov',
      label: t('croissant.bakery.kpi.aov'),
      value: 26.4,
      formatValue: (n) => currency.format(Math.round(n)),
      delta: -1.8,
      deltaLabel: t('croissant.bakery.kpi.deltaLabel'),
      icon: <Receipt className="h-4 w-4" />,
      spark: [28, 27, 26, 25, 24, 26, 26, 25, 24, 25, 26, 26],
      tone: 'info',
    },
    {
      id: 'baked',
      label: t('croissant.bakery.kpi.itemsBaked'),
      value: 2140,
      delta: 8.4,
      deltaLabel: t('croissant.bakery.kpi.deltaLabel'),
      icon: <Flame className="h-4 w-4" />,
      spark: [180, 210, 240, 260, 240, 220, 280, 300, 310, 320, 360, 400],
      tone: 'warning',
    },
    {
      id: 'refunds',
      label: t('croissant.bakery.kpi.refunds'),
      value: 14,
      delta: -2.1,
      deltaLabel: t('croissant.bakery.kpi.deltaLabel'),
      icon: <AlertTriangle className="h-4 w-4" />,
      spark: [4, 3, 5, 2, 3, 1, 2, 3, 1, 2, 1, 0],
      tone: 'danger',
    },
    {
      id: 'conv',
      label: t('croissant.bakery.kpi.conversion'),
      value: 62.1,
      unit: '%',
      delta: 3.4,
      deltaLabel: t('croissant.bakery.kpi.deltaLabel'),
      icon: <Target className="h-4 w-4" />,
      spark: [55, 57, 58, 60, 59, 61, 62, 60, 63, 64, 62, 62],
      tone: 'success',
      accent: true,
    },
  ];

  const columns = useMemo<ColumnDef<OrderRow, unknown>[]>(
    () => [
      {
        id: 'id',
        header: t('croissant.bakery.orders.col.id'),
        accessorKey: 'id',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            <span className="font-mono text-xs text-foreground-muted">{row.original.id}</span>
            {row.index === 0 ? (
              <span
                data-print="hide"
                className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning"
              >
                {t('croissant.bakery.orders.justNow')}
                <TypingDots color="muted" />
              </span>
            ) : null}
          </span>
        ),
      },
      {
        id: 'customer',
        header: t('croissant.bakery.orders.col.customer'),
        accessorKey: 'customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" name={row.original.customer} />
            <span className="text-sm font-medium text-foreground">{row.original.customer}</span>
          </div>
        ),
      },
      {
        id: 'items',
        header: t('croissant.bakery.orders.col.items'),
        accessorKey: 'items',
        cell: ({ row }) => (
          <span className="text-sm text-foreground-muted">{row.original.items}</span>
        ),
      },
      {
        id: 'status',
        header: t('croissant.bakery.orders.col.status'),
        accessorKey: 'status',
        cell: ({ row }) => statusBadge(row.original.status, t),
      },
      {
        id: 'total',
        header: t('croissant.bakery.orders.col.total'),
        accessorKey: 'total',
        cell: ({ row }) => (
          <span className="block text-right font-medium tabular-nums">
            {currency.format(row.original.total)}
          </span>
        ),
      },
    ],
    [t, currency],
  );

  const meta = (
    <>
      <Chip tone="warning" dot>
        {t('croissant.bakery.meta.live')}
      </Chip>
      <Chip tone="primary">{t('croissant.bakery.meta.ordersHr', { n: 42 })}</Chip>
      <Chip tone="info">{t('croissant.bakery.meta.ovens', { n: 4 })}</Chip>
    </>
  );

  const handleMarkFulfilled = () => {
    toast.success(t('croissant.bakery.orders.markedFulfilled', { count: selectedRows.length }));
    setSelectedRows([]);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <SceneHeader
        tone="warning"
        pattern="dots"
        eyebrow={t('croissant.bakery.scene.eyebrow')}
        title={
          <span className="inline-flex items-center gap-3">
            <CroissantIcon
              aria-hidden="true"
              className="h-7 w-7"
              style={{ color: '#a3621f', fill: '#a3621f' }}
            />
            {t('croissant.bakery.scene.title')}
          </span>
        }
        description={t('croissant.bakery.scene.description')}
        meta={meta}
      />

      <StagedSection
        tone="warning"
        eyebrow={t('croissant.bakery.section.pulseEyebrow')}
        title={t('croissant.bakery.section.pulse')}
        description={t('croissant.bakery.section.pulseDesc')}
        headingId="bakery-pulse"
      >
        <StatRail items={stats} />
      </StagedSection>

      <StagedSection
        tone="warning"
        eyebrow={t('croissant.bakery.section.ovensEyebrow')}
        title={t('croissant.bakery.section.ovens')}
        description={t('croissant.bakery.section.ovensDesc')}
        headingId="bakery-ovens"
      >
        <OvenBoard />
      </StagedSection>

      <StagedSection
        tone="warning"
        eyebrow={t('croissant.bakery.section.revenueEyebrow')}
        title={t('croissant.bakery.section.revenue')}
        description={t('croissant.bakery.section.revenueDesc')}
        headingId="bakery-revenue"
      >
        <ChartFrame
          tone="warning"
          eyebrow={t('croissant.bakery.chart.eyebrow')}
          title={t('croissant.bakery.chart.title')}
          description={t('croissant.bakery.chart.description')}
          action={
            <div
              className="inline-flex overflow-hidden rounded-md border border-border"
              role="group"
              aria-label={t('croissant.bakery.chart.toggleLabel')}
            >
              {(['day', 'week', 'month'] as const).map((r) => (
                <Button
                  key={r}
                  variant={range === r ? 'primary' : 'ghost'}
                  size="sm"
                  className="rounded-none border-0 border-r border-border last:border-r-0"
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                >
                  {t(`croissant.bakery.chart.range.${r}`)}
                </Button>
              ))}
            </div>
          }
          insight={
            insight !== null
              ? t('croissant.bakery.chart.insight', {
                  best: insight.best,
                  bestVal: insight.bestVal,
                  worst: insight.worst,
                  worstVal: insight.worstVal,
                })
              : null
          }
        >
          <AreaChart
            xKey="label"
            data={[...revenueSeries]}
            series={[
              { key: 'revenue', label: t('croissant.bakery.chart.revenueLabel'), color: 'warning' },
              { key: 'target', label: t('croissant.bakery.chart.targetLabel'), color: 'info' },
            ]}
            yFormatter={(n) => currency.format(n)}
            height={260}
          />
        </ChartFrame>
      </StagedSection>

      <StagedSection
        tone="warning"
        eyebrow={t('croissant.bakery.section.sellersEyebrow')}
        title={t('croissant.bakery.section.sellers')}
        description={t('croissant.bakery.section.sellersDesc')}
        headingId="bakery-sellers"
      >
        <TopSellers />
      </StagedSection>

      <StagedSection
        tone="warning"
        eyebrow={t('croissant.bakery.section.ordersEyebrow')}
        title={t('croissant.bakery.section.orders')}
        description={t('croissant.bakery.section.ordersDesc')}
        headingId="bakery-orders"
      >
        <div className="space-y-3">
          {selectedRows.length > 0 ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <span data-print="hide">
                  <PulseRing size="sm" color="warning" />
                </span>
                {t('croissant.bakery.orders.selected', { count: selectedRows.length })}
              </span>
              <Button
                size="sm"
                leftIcon={<Activity className="h-4 w-4" />}
                onClick={handleMarkFulfilled}
              >
                {t('croissant.bakery.orders.markFulfilled')}
              </Button>
            </div>
          ) : null}
          <DataTable<OrderRow>
            columns={columns}
            data={[...ORDERS]}
            getRowId={(r) => r.id}
            enableRowSelection
            enableGlobalFilter={false}
            enableColumnVisibility={false}
            onRowSelectionChange={setSelectedRows}
            pageSize={8}
          />
        </div>
      </StagedSection>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
