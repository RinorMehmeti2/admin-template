import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Croissant as CroissantIcon,
  Download,
  Plus,
  Sparkles,
  ShoppingCart,
  Coins,
  Receipt,
  Repeat,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Badge } from '@/components/primitives/Badge';
import { Avatar } from '@/components/primitives/Avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/feedback/Tooltip';
import { StatCard } from '@/components/data-display/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/data-display/Card';
import { AreaChart } from '@/components/data-display/charts/AreaChart';
import { BarChart } from '@/components/data-display/charts/BarChart';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/data-display/Table';
import { ComponentsUsedFooter, SectionHeader } from '../_shared';

interface OrderRow {
  id: string;
  customer: string;
  items: string;
  status: 'paid' | 'pending' | 'refunded';
  total: number;
}

const ORDERS: ReadonlyArray<OrderRow> = [
  { id: '#1042', customer: 'Ada Lovelace', items: '3 × croissant, 1 × latte', status: 'paid', total: 18.5 },
  { id: '#1041', customer: 'Grace Hopper', items: '6 × pain au chocolat', status: 'pending', total: 24.0 },
  { id: '#1040', customer: 'Linus Torvalds', items: '2 × sourdough', status: 'paid', total: 14.0 },
  { id: '#1039', customer: 'Margaret Hamilton', items: '1 × kouign-amann', status: 'refunded', total: 6.5 },
  { id: '#1038', customer: 'Edsger Dijkstra', items: '4 × almond croissant', status: 'paid', total: 28.0 },
  { id: '#1037', customer: 'Alan Turing', items: '2 × cinnamon roll, 1 × cappuccino', status: 'pending', total: 16.75 },
];

const REVENUE = [
  { day: 'Mon', revenue: 820, target: 700 },
  { day: 'Tue', revenue: 910, target: 700 },
  { day: 'Wed', revenue: 1180, target: 800 },
  { day: 'Thu', revenue: 980, target: 800 },
  { day: 'Fri', revenue: 1420, target: 900 },
  { day: 'Sat', revenue: 1640, target: 900 },
  { day: 'Sun', revenue: 1320, target: 900 },
];

const CATEGORIES = [
  { name: 'Mon', croissants: 42, breads: 18, cakes: 9 },
  { name: 'Tue', croissants: 51, breads: 22, cakes: 11 },
  { name: 'Wed', croissants: 60, breads: 28, cakes: 14 },
  { name: 'Thu', croissants: 49, breads: 25, cakes: 13 },
  { name: 'Fri', croissants: 72, breads: 34, cakes: 18 },
  { name: 'Sat', croissants: 86, breads: 40, cakes: 21 },
  { name: 'Sun', croissants: 70, breads: 31, cakes: 17 },
];

const COMPONENTS = [
  'PageHeader',
  'Button',
  'IconButton',
  'Tooltip',
  'StatCard',
  'Card',
  'AreaChart',
  'BarChart',
  'Table',
  'Badge',
  'Avatar',
];

function statusBadge(status: OrderRow['status'], t: (k: string) => string) {
  if (status === 'paid') return <Badge variant="success" dot>{t('croissant.bakery.status.paid')}</Badge>;
  if (status === 'pending') return <Badge variant="warning" dot>{t('croissant.bakery.status.pending')}</Badge>;
  return <Badge variant="danger" dot>{t('croissant.bakery.status.refunded')}</Badge>;
}

export function BakeryDashboardPage() {
  const { t, i18n } = useTranslation();

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [i18n.language],
  );

  const actions = (
    <>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            {t('croissant.bakery.actions.export')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('croissant.bakery.tooltip.export')}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            {t('croissant.bakery.actions.newReport')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('croissant.bakery.tooltip.newReport')}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <IconButton aria-label={t('croissant.bakery.actions.surprise')} variant="ghost">
            <Sparkles className="h-4 w-4" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>{t('croissant.bakery.tooltip.surprise')}</TooltipContent>
      </Tooltip>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <CroissantIcon
              aria-hidden="true"
              className="h-6 w-6"
              style={{ color: '#a3621f', fill: '#a3621f' }}
            />
            {t('croissant.bakery.title')}
          </span>
        }
        description={t('croissant.bakery.subtitle')}
        actions={actions}
      />

      <section className="space-y-4" aria-labelledby="kpis-heading">
        <SectionHeader
          tone="primary"
          eyebrow={t('croissant.bakery.section.kpisEyebrow')}
          title={<span id="kpis-heading">{t('croissant.bakery.section.kpis')}</span>}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t('croissant.bakery.kpi.revenue')}
            value={48210}
            formatValue={(n) => currency.format(n)}
            delta={12.4}
            deltaLabel={t('croissant.bakery.kpi.deltaLabel')}
            icon={<Coins className="h-4 w-4" />}
            sparklineData={[12, 18, 14, 24, 20, 28, 32]}
          />
          <StatCard
            label={t('croissant.bakery.kpi.orders')}
            value={1280}
            delta={6.2}
            deltaLabel={t('croissant.bakery.kpi.deltaLabel')}
            icon={<ShoppingCart className="h-4 w-4" />}
            sparklineData={[42, 48, 60, 51, 72, 86, 70]}
          />
          <StatCard
            label={t('croissant.bakery.kpi.avgBasket')}
            value={26.4}
            formatValue={(n) => currency.format(n)}
            delta={-1.8}
            deltaLabel={t('croissant.bakery.kpi.deltaLabel')}
            icon={<Receipt className="h-4 w-4" />}
            sparklineData={[28, 27, 26, 25, 24, 26, 26]}
          />
          <StatCard
            label={t('croissant.bakery.kpi.repeat')}
            value={62.1}
            unit="%"
            delta={3.4}
            deltaLabel={t('croissant.bakery.kpi.deltaLabel')}
            icon={<Repeat className="h-4 w-4" />}
            sparklineData={[55, 57, 58, 60, 59, 61, 62]}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="charts-heading">
        <SectionHeader
          tone="success"
          eyebrow={t('croissant.bakery.section.chartsEyebrow')}
          title={<span id="charts-heading">{t('croissant.bakery.section.charts')}</span>}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card variant="outlined" className="overflow-hidden">
            <CardHeader>
              <CardTitle>{t('croissant.bakery.section.charts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AreaChart
                xKey="day"
                data={REVENUE}
                series={[
                  {
                    key: 'revenue',
                    label: t('croissant.bakery.chart.revenueLabel'),
                    color: 'primary',
                  },
                  {
                    key: 'target',
                    label: t('croissant.bakery.chart.targetLabel'),
                    color: 'info',
                  },
                ]}
                yFormatter={(n) => currency.format(n)}
                height={260}
              />
            </CardContent>
          </Card>

          <Card variant="outlined" className="overflow-hidden">
            <CardHeader>
              <CardTitle>{t('croissant.bakery.chart.byCategory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                xKey="name"
                data={CATEGORIES}
                series={[
                  {
                    key: 'croissants',
                    label: t('croissant.bakery.chart.croissants'),
                    color: 'primary',
                  },
                  {
                    key: 'breads',
                    label: t('croissant.bakery.chart.breads'),
                    color: 'success',
                  },
                  {
                    key: 'cakes',
                    label: t('croissant.bakery.chart.cakes'),
                    color: 'warning',
                  },
                ]}
                height={260}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="orders-heading">
        <SectionHeader
          tone="warning"
          eyebrow={t('croissant.bakery.section.ordersEyebrow')}
          title={<span id="orders-heading">{t('croissant.bakery.section.orders')}</span>}
        />
        <Card variant="outlined" className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('croissant.bakery.orders.col.id')}</TableHead>
                <TableHead>{t('croissant.bakery.orders.col.customer')}</TableHead>
                <TableHead>{t('croissant.bakery.orders.col.items')}</TableHead>
                <TableHead>{t('croissant.bakery.orders.col.status')}</TableHead>
                <TableHead className="text-right">{t('croissant.bakery.orders.col.total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-foreground-muted">{row.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm" name={row.customer} />
                      <span className="text-sm font-medium text-foreground">{row.customer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground-muted">{row.items}</TableCell>
                  <TableCell>{statusBadge(row.status, t)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {currency.format(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
