import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Bell,
  Calendar,
  ClipboardList,
  Download,
  FileBarChart,
  Inbox,
  X,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { DataTable, type ColumnDef, type Row } from '@/components/data-display/DataTable';
import { EmptyState } from '@/components/data-display/EmptyState';
import { BarChart } from '@/components/data-display/charts/BarChart';
import { LineChart } from '@/components/data-display/charts/LineChart';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { SimsStatCard } from '@/pages/sims/components/SimsStatCard';

type Product = 'classic' | 'almond' | 'chocolate' | 'sourdough' | 'baguette' | 'brioche';
type Status = 'pass' | 'fail' | 'review';

interface Batch {
  id: string;
  product: Product;
  oven: 'A' | 'B' | 'C' | 'D';
  bakeTime: number;
  temp: number;
  score: number;
  status: Status;
  date: string;
  notes: string;
}

const PRODUCTS: ReadonlyArray<Product> = [
  'classic',
  'almond',
  'chocolate',
  'sourdough',
  'baguette',
  'brioche',
];

function gen(): Batch[] {
  const rows: Batch[] = [];
  const start = new Date('2026-05-08').getTime();
  for (let i = 0; i < 64; i++) {
    const product = PRODUCTS[i % PRODUCTS.length] as Product;
    const oven = (['A', 'B', 'C', 'D'] as const)[i % 4] as 'A' | 'B' | 'C' | 'D';
    const bakeTime = 18 + (i % 24);
    const temp = 188 + ((i * 7) % 14);
    const score = Math.max(40, Math.min(99, 84 + ((i * 13) % 20) - 8));
    let status: Status = 'pass';
    if (score < 70) status = 'fail';
    else if (score < 80) status = 'review';
    const date = new Date(start + i * 36e5).toISOString().slice(0, 10);
    rows.push({
      id: `B-${(i + 1).toString().padStart(3, '0')}`,
      product,
      oven,
      bakeTime,
      temp,
      score,
      status,
      date,
      notes:
        status === 'fail'
          ? 'Temperature spiked late in the bake. Crust over-browned, crumb underdone.'
          : status === 'review'
            ? 'Color slightly uneven — proofing time may be a touch short.'
            : 'Even crumb, golden top, clean release. Standard batch.',
    });
  }
  return rows;
}

const ROWS = gen();

const PRODUCT_LABEL_KEY: Record<Product, string> = {
  classic: 'croissant.dataLab.product.classic',
  almond: 'croissant.dataLab.product.almond',
  chocolate: 'croissant.dataLab.product.chocolate',
  sourdough: 'croissant.dataLab.product.sourdough',
  baguette: 'croissant.dataLab.product.baguette',
  brioche: 'croissant.dataLab.product.brioche',
};

const STATUS_VARIANT: Record<Status, 'success' | 'warning' | 'danger'> = {
  pass: 'success',
  review: 'warning',
  fail: 'danger',
};

type KpiKey = null | 'low' | 'review' | 'fail';

interface StatDef {
  id: string;
  kpi: KpiKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  value: string | number;
  delta: number;
}

function trendFor(delta: number): 'up' | 'down' | 'flat' {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

function trendLabel(delta: number): string {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}%`;
}

export function DataLabPage() {
  const { t } = useTranslation();
  const [activeKpi, setActiveKpi] = useState<KpiKey>(null);
  const [selected, setSelected] = useState<Batch | null>(null);

  const filtered = useMemo(() => {
    if (activeKpi === null) return ROWS;
    if (activeKpi === 'low') return ROWS.filter((r) => r.score < 80);
    if (activeKpi === 'review') return ROWS.filter((r) => r.status === 'review');
    return ROWS.filter((r) => r.status === 'fail');
  }, [activeKpi]);

  const stats: ReadonlyArray<StatDef> = [
    {
      id: 'batches',
      kpi: null,
      label: t('croissant.dataLab.kpi.batches'),
      Icon: FileBarChart,
      value: ROWS.length,
      delta: 4.4,
    },
    {
      id: 'avgScore',
      kpi: 'low',
      label: t('croissant.dataLab.kpi.avgScore'),
      Icon: ClipboardList,
      value: Math.round(ROWS.reduce((s, r) => s + r.score, 0) / ROWS.length),
      delta: 1.2,
    },
    {
      id: 'review',
      kpi: 'review',
      label: t('croissant.dataLab.kpi.review'),
      Icon: AlertTriangle,
      value: ROWS.filter((r) => r.status === 'review').length,
      delta: -1.1,
    },
    {
      id: 'fail',
      kpi: 'fail',
      label: t('croissant.dataLab.kpi.fail'),
      Icon: X,
      value: ROWS.filter((r) => r.status === 'fail').length,
      delta: 0.8,
    },
  ];

  const columns = useMemo<ColumnDef<Batch, unknown>[]>(
    () => [
      { id: 'id', header: t('croissant.dataLab.col.id'), accessorKey: 'id' },
      {
        id: 'product',
        header: t('croissant.dataLab.col.product'),
        accessorKey: 'product',
        cell: ({ row }) => (
          <span className="text-sm">{t(PRODUCT_LABEL_KEY[row.original.product])}</span>
        ),
        meta: {
          filterVariant: 'multi-select',
          filterOptions: PRODUCTS.map((p) => ({ value: p, label: t(PRODUCT_LABEL_KEY[p]) })),
          headerLabel: t('croissant.dataLab.col.product'),
        },
      },
      { id: 'oven', header: t('croissant.dataLab.col.oven'), accessorKey: 'oven' },
      {
        id: 'bakeTime',
        header: t('croissant.dataLab.col.bakeTime'),
        accessorKey: 'bakeTime',
        cell: ({ row }) => <span className="tabular-nums">{row.original.bakeTime}m</span>,
      },
      {
        id: 'temp',
        header: t('croissant.dataLab.col.temp'),
        accessorKey: 'temp',
        cell: ({ row }) => <span className="tabular-nums">{row.original.temp}°C</span>,
      },
      {
        id: 'score',
        header: t('croissant.dataLab.col.score'),
        accessorKey: 'score',
        cell: ({ row }) => {
          const score = row.original.score;
          const tone = score >= 80 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-danger';
          return <span className={cn('font-semibold tabular-nums', tone)}>{score}</span>;
        },
      },
      {
        id: 'status',
        header: t('croissant.dataLab.col.status'),
        accessorKey: 'status',
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]} dot>
            {t(`croissant.dataLab.statusLabel.${row.original.status}`)}
          </Badge>
        ),
        meta: {
          filterVariant: 'multi-select',
          filterOptions: (['pass', 'review', 'fail'] as const).map((s) => ({
            value: s,
            label: t(`croissant.dataLab.statusLabel.${s}`),
          })),
          headerLabel: t('croissant.dataLab.col.status'),
        },
      },
      { id: 'date', header: t('croissant.dataLab.col.date'), accessorKey: 'date' },
    ],
    [t],
  );

  // Score distribution histogram
  const histogram = useMemo(() => {
    const bins = [
      { range: '40-49', count: 0 },
      { range: '50-59', count: 0 },
      { range: '60-69', count: 0 },
      { range: '70-79', count: 0 },
      { range: '80-89', count: 0 },
      { range: '90-99', count: 0 },
    ];
    ROWS.forEach((r) => {
      const idx = Math.min(5, Math.floor((r.score - 40) / 10));
      const bin = bins[idx];
      if (bin !== undefined) bin.count += 1;
    });
    return bins;
  }, []);

  // Outliers
  const outliers = useMemo(() => [...ROWS].sort((a, b) => a.score - b.score).slice(0, 3), []);

  // Temperature curve for selected batch
  const tempCurve = useMemo(() => {
    if (selected === null) return [];
    const base = selected.temp;
    return Array.from({ length: 12 }, (_, i) => ({
      t: i,
      temp:
        base +
        Math.sin(i / 2) * 8 +
        (i === 6 ? 4 : 0) -
        (selected.status === 'fail' && i > 8 ? 10 : 0),
    }));
  }, [selected]);

  // Inspector heatmap 7x24 (day x hour)
  const heatmap = useMemo(() => {
    const days = 7;
    const hours = 24;
    const data: number[][] = [];
    for (let d = 0; d < days; d++) {
      const row: number[] = [];
      for (let h = 0; h < hours; h++) {
        const morning = Math.max(0, 8 - Math.abs(h - 7));
        const afternoon = Math.max(0, 6 - Math.abs(h - 14));
        const noise = (d * 13 + h * 7) % 4;
        row.push(Math.max(0, morning + afternoon + noise - 2));
      }
      data.push(row);
    }
    return data;
  }, []);

  const heatmapMax = Math.max(...heatmap.flat());

  const exportCards: ReadonlyArray<{
    icon: ComponentType<{ className?: string }>;
    title: string;
    desc: string;
  }> = [
    {
      icon: Download,
      title: 'croissant.dataLab.export.csv',
      desc: 'croissant.dataLab.export.csvDesc',
    },
    {
      icon: Calendar,
      title: 'croissant.dataLab.export.schedule',
      desc: 'croissant.dataLab.export.scheduleDesc',
    },
    {
      icon: Bell,
      title: 'croissant.dataLab.export.alerts',
      desc: 'croissant.dataLab.export.alertsDesc',
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <SimsPageHeader
        title={t('croissant.dataLab.scene.title')}
        description={t('croissant.dataLab.scene.description')}
        actions={
          <>
            <Badge variant="neutral" size="sm" dot>
              {t('croissant.dataLab.meta.batches', { n: ROWS.length })}
            </Badge>
            <Badge variant="danger" size="sm">
              {t('croissant.dataLab.meta.anomalies', { n: outliers.length })}
            </Badge>
          </>
        }
      />

      <section aria-labelledby="data-kpi" className="space-y-4">
        <div>
          <h2 id="data-kpi" className="text-lg font-semibold text-foreground">
            {t('croissant.dataLab.section.kpi')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.dataLab.section.kpiDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const active = activeKpi === s.kpi;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveKpi(s.kpi)}
                aria-pressed={active}
                className="rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <SimsStatCard
                  Icon={s.Icon}
                  label={s.label}
                  value={s.value}
                  trend={trendFor(s.delta)}
                  trendValue={trendLabel(s.delta)}
                  className={cn(
                    active && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                  )}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="data-inspect" className="space-y-4">
        <div>
          <h2 id="data-inspect" className="text-lg font-semibold text-foreground">
            {t('croissant.dataLab.section.inspect')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.dataLab.section.inspectDesc')}
          </p>
        </div>
        <div className="space-y-3">
          {activeKpi !== null ? (
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-sm">
              <span>
                {t('croissant.dataLab.filter.active', {
                  label: t(`croissant.dataLab.kpiFilter.${activeKpi}`),
                })}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setActiveKpi(null)}>
                {t('croissant.dataLab.filter.clear')}
              </Button>
            </div>
          ) : null}
          <DataTable<Batch>
            columns={columns}
            data={[...filtered]}
            getRowId={(r) => r.id}
            enableRowSelection
            enableExpanding
            renderExpandedRow={(row: Row<Batch>) => (
              <div className="rounded-md bg-surface-muted/40 p-3 text-sm text-foreground-muted">
                <p className="font-medium text-foreground">
                  {t('croissant.dataLab.expanded.notes')}
                </p>
                <p className="mt-1">{row.original.notes}</p>
              </div>
            )}
            enableGlobalFilter={false}
            enableColumnFilters
            enableColumnVisibility
            onRowClick={(row) => setSelected(row)}
            pageSize={10}
            emptyState={
              <EmptyState
                icon={<Inbox className="h-6 w-6" />}
                title={t('croissant.dataLab.empty.title')}
                description={t('croissant.dataLab.empty.desc')}
              />
            }
          />
        </div>
      </section>

      {selected !== null ? (
        <Card variant="outlined">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>
                {selected.id} · {t(PRODUCT_LABEL_KEY[selected.product])}
              </CardTitle>
              <CardDescription>{selected.notes}</CardDescription>
            </div>
            <IconButton
              aria-label={t('croissant.dataLab.detail.close')}
              variant="ghost"
              size="sm"
              onClick={() => setSelected(null)}
            >
              <X className="h-4 w-4" />
            </IconButton>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>{t('croissant.dataLab.detail.tempTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  xKey="t"
                  data={tempCurve}
                  series={[
                    {
                      key: 'temp',
                      label: t('croissant.dataLab.detail.tempLabel'),
                      color: 'secondary',
                    },
                  ]}
                  height={200}
                  yFormatter={(v) => `${Math.round(v)}°C`}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'flex h-20 items-center justify-center rounded-md',
                    i === 1 ? 'bg-warning/10' : i === 2 ? 'bg-info/10' : 'bg-success/10',
                  )}
                  aria-label={t('croissant.dataLab.detail.photo', { n: i })}
                >
                  <span className="text-xs text-foreground-muted">
                    {t('croissant.dataLab.detail.photoLabel', { n: i })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section aria-labelledby="data-hist" className="space-y-4">
        <div>
          <h2 id="data-hist" className="text-lg font-semibold text-foreground">
            {t('croissant.dataLab.section.hist')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.dataLab.section.histDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>{t('croissant.dataLab.hist.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                xKey="range"
                data={[...histogram]}
                series={[
                  { key: 'count', label: t('croissant.dataLab.hist.count'), color: 'secondary' },
                ]}
                height={220}
              />
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>{t('croissant.dataLab.outliers.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {outliers.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface-muted/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {o.id} · {t(PRODUCT_LABEL_KEY[o.product])}
                      </p>
                      <p className="truncate text-xs text-foreground-muted">{o.notes}</p>
                    </div>
                    <Badge variant="danger" size="sm">
                      {o.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="data-heatmap" className="space-y-4">
        <div>
          <h2 id="data-heatmap" className="text-lg font-semibold text-foreground">
            {t('croissant.dataLab.section.heatmap')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.dataLab.section.heatmapDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-1 text-[10px]">
                <span aria-hidden="true" />
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h} className="text-center text-foreground-subtle">
                    {h}
                  </span>
                ))}
                {heatmap.map((row, d) => (
                  <div key={d} className="contents">
                    <span className="self-center pr-1 text-right text-foreground-subtle">
                      {t(`croissant.dataLab.heatmap.day.${d}`)}
                    </span>
                    {row.map((val, h) => (
                      <span
                        key={h}
                        title={t('croissant.dataLab.heatmap.cell', { day: d, hour: h, count: val })}
                        className="block h-5 rounded-sm bg-secondary"
                        style={{ opacity: Math.max(0.05, val / heatmapMax) }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="data-export" className="space-y-4">
        <div>
          <h2 id="data-export" className="text-lg font-semibold text-foreground">
            {t('croissant.dataLab.section.export')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.dataLab.section.exportDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {exportCards.map(({ icon: Icon, title, desc }) => (
            <Card key={title} variant="outlined">
              <CardContent className="space-y-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-foreground">{t(title)}</p>
                <p className="text-xs text-foreground-muted">{t(desc)}</p>
                <Button size="sm" variant="outline">
                  {t('croissant.dataLab.export.cta')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
