import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Coffee,
  Coins,
  CookingPot,
  Crown,
  FileText,
  PackageCheck,
  RotateCw,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Avatar } from '@/components/primitives/Avatar';
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
import { Timeline, TimelineItem, type TimelineVariant } from '@/components/data-display/Timeline';
import { DataTable, type ColumnDef, type Row } from '@/components/data-display/DataTable';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { SimsStatCard } from '@/pages/sims/components/SimsStatCard';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { CommentsThread } from './components/CommentsThread';

interface TimelineEntry {
  id: number;
  time: string;
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  variant: TimelineVariant;
  actor?: string;
}

const ENTRIES: ReadonlyArray<TimelineEntry> = [
  {
    id: 1,
    time: '2026-05-14T05:00:00',
    title: 'First bake',
    desc: 'Ovens warmed; first sourdough loaves in.',
    icon: Sun,
    variant: 'warning',
    actor: 'Linus',
  },
  {
    id: 2,
    time: '2026-05-14T06:30:00',
    title: 'Doors open',
    desc: 'Counter opens with fresh croissants and coffee.',
    icon: ShoppingBag,
    variant: 'default',
    actor: 'Margaret',
  },
  {
    id: 3,
    time: '2026-05-14T08:14:00',
    title: 'Morning rush',
    desc: 'Peak hour — 42 orders in 60 minutes.',
    icon: Coffee,
    variant: 'success',
    actor: 'Crew',
  },
  {
    id: 4,
    time: '2026-05-14T10:42:00',
    title: 'Second bake',
    desc: 'Almond + pain au chocolat trays in for 11 AM service.',
    icon: CookingPot,
    variant: 'warning',
    actor: 'Ada',
  },
  {
    id: 5,
    time: '2026-05-14T12:00:00',
    title: 'Lunch line',
    desc: 'Salad-and-baguette specials sell out by 1:15 PM.',
    icon: ShoppingBag,
    variant: 'info',
    actor: 'Margaret',
  },
  {
    id: 6,
    time: '2026-05-14T14:00:00',
    title: 'Wholesale pickup',
    desc: 'Le Bistro picks up the weekly wholesale order.',
    icon: PackageCheck,
    variant: 'info',
    actor: 'Alan',
  },
  {
    id: 7,
    time: '2026-05-14T15:18:00',
    title: 'New hire onboarded',
    desc: 'Edsger signs the apprenticeship paperwork.',
    icon: Sparkles,
    variant: 'success',
    actor: 'Manager',
  },
  {
    id: 8,
    time: '2026-05-14T17:00:00',
    title: 'Third bake',
    desc: 'Evening croissants for the takeaway crowd.',
    icon: CookingPot,
    variant: 'warning',
    actor: 'Ada',
  },
  {
    id: 9,
    time: '2026-05-14T18:30:00',
    title: 'MVP of the day',
    desc: 'Grace closes the prep list 20 min early.',
    icon: Crown,
    variant: 'success',
    actor: 'Grace',
  },
  {
    id: 10,
    time: '2026-05-14T19:00:00',
    title: 'Inventory check',
    desc: "Pastry case reset; tomorrow's prep list drafted.",
    icon: FileText,
    variant: 'muted',
    actor: 'Linus',
  },
  {
    id: 11,
    time: '2026-05-14T19:45:00',
    title: 'Tip share',
    desc: 'Tips distributed across the shift.',
    icon: Coins,
    variant: 'success',
    actor: 'Manager',
  },
  {
    id: 12,
    time: '2026-05-14T20:00:00',
    title: 'Close up',
    desc: 'Last lights off; alarm armed; doors locked.',
    icon: Star,
    variant: 'muted',
    actor: 'Margaret',
  },
];

interface AuditRow {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'danger';
  json: string;
}

const AUDIT: ReadonlyArray<AuditRow> = [
  {
    id: 'AU-001',
    ts: '07:01:12',
    actor: 'Linus',
    action: 'opened',
    target: 'Cash drawer',
    severity: 'info',
    json: '{"till":1,"opening":250}',
  },
  {
    id: 'AU-002',
    ts: '08:14:43',
    actor: 'Margaret',
    action: 'sold',
    target: 'Order #1041',
    severity: 'info',
    json: '{"order":1041,"items":3,"total":24.0}',
  },
  {
    id: 'AU-003',
    ts: '10:32:08',
    actor: 'Ada',
    action: 'refunded',
    target: 'Order #1039',
    severity: 'warning',
    json: '{"order":1039,"reason":"wrong item"}',
  },
  {
    id: 'AU-004',
    ts: '12:01:00',
    actor: 'System',
    action: 'alert',
    target: 'Oven C',
    severity: 'danger',
    json: '{"oven":"C","temp":228,"target":210}',
  },
  {
    id: 'AU-005',
    ts: '14:18:55',
    actor: 'Alan',
    action: 'dispatched',
    target: 'Le Bistro',
    severity: 'info',
    json: '{"customer":"Le Bistro","crates":4}',
  },
  {
    id: 'AU-006',
    ts: '16:42:30',
    actor: 'Margaret',
    action: 'reset',
    target: 'Counter cash',
    severity: 'info',
    json: '{"till":1,"variance":-2.4}',
  },
  {
    id: 'AU-007',
    ts: '18:55:01',
    actor: 'Grace',
    action: 'updated',
    target: 'Prep list',
    severity: 'info',
    json: '{"items":18,"changes":4}',
  },
];

const SEVERITY_VARIANT: Record<AuditRow['severity'], 'info' | 'warning' | 'danger'> = {
  info: 'info',
  warning: 'warning',
  danger: 'danger',
};

interface StatDef {
  id: string;
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

const CHART_SPARK = [22, 36, 48, 42, 28, 22, 18, 14, 10, 8, 6, 4];

export function TimelineActivityPage() {
  const { t, i18n } = useTranslation();
  const [auditDetail, setAuditDetail] = useState<AuditRow | null>(null);

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }),
    [i18n.language],
  );

  const stats: ReadonlyArray<StatDef> = [
    {
      id: 'orders',
      label: t('croissant.timeline.day.orders'),
      Icon: ShoppingBag,
      value: 312,
      delta: 4.2,
    },
    {
      id: 'peak',
      label: t('croissant.timeline.day.peak'),
      Icon: Sun,
      value: '8 AM',
      delta: 0,
    },
    {
      id: 'top',
      label: t('croissant.timeline.day.top'),
      Icon: Crown,
      value: 412,
      delta: 6.4,
    },
    {
      id: 'refunds',
      label: t('croissant.timeline.day.refunds'),
      Icon: RotateCw,
      value: 3,
      delta: -1.2,
    },
    {
      id: 'customers',
      label: t('croissant.timeline.day.customers'),
      Icon: Coffee,
      value: 247,
      delta: 5.1,
    },
  ];

  const auditColumns = useMemo<ColumnDef<AuditRow, unknown>[]>(
    () => [
      { id: 'ts', header: t('croissant.timeline.audit.col.ts'), accessorKey: 'ts' },
      { id: 'actor', header: t('croissant.timeline.audit.col.actor'), accessorKey: 'actor' },
      { id: 'action', header: t('croissant.timeline.audit.col.action'), accessorKey: 'action' },
      { id: 'target', header: t('croissant.timeline.audit.col.target'), accessorKey: 'target' },
      {
        id: 'severity',
        header: t('croissant.timeline.audit.col.severity'),
        accessorKey: 'severity',
        cell: ({ row }: { row: Row<AuditRow> }) => (
          <Badge variant={SEVERITY_VARIANT[row.original.severity]} dot>
            {t(`croissant.timeline.audit.severity.${row.original.severity}`)}
          </Badge>
        ),
        meta: {
          filterVariant: 'multi-select',
          filterOptions: (['info', 'warning', 'danger'] as const).map((s) => ({
            value: s,
            label: t(`croissant.timeline.audit.severity.${s}`),
          })),
          headerLabel: t('croissant.timeline.audit.col.severity'),
        },
      },
    ],
    [t],
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <SimsPageHeader
        title={t('croissant.timeline.scene.title')}
        description={t('croissant.timeline.scene.description')}
        actions={
          <>
            <Badge variant="info" size="sm" dot>
              {t('croissant.timeline.meta.live')}
            </Badge>
            <Badge variant="warning" size="sm">
              {t('croissant.timeline.meta.events', { n: 47 })}
            </Badge>
          </>
        }
      />

      <section aria-labelledby="timeline-day" className="space-y-4">
        <div>
          <h2 id="timeline-day" className="text-lg font-semibold text-foreground">
            {t('croissant.timeline.section.day')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.timeline.section.dayDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <SimsStatCard
              key={s.id}
              Icon={s.Icon}
              label={s.label}
              value={s.value}
              trend={trendFor(s.delta)}
              trendValue={trendLabel(s.delta)}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="timeline-hero" className="space-y-4">
        <div>
          <h2 id="timeline-hero" className="text-lg font-semibold text-foreground">
            {t('croissant.timeline.section.hero')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.timeline.section.heroDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardContent>
            <Timeline>
              {ENTRIES.map((e) => {
                const Icon = e.icon;
                return (
                  <TimelineItem
                    key={e.id}
                    timestamp={new Date(e.time)}
                    variant={e.variant}
                    icon={<Icon className="h-4 w-4" />}
                    actor={
                      e.actor !== undefined ? (
                        <span className="inline-flex items-center gap-2">
                          <Avatar size="xs" name={e.actor} />
                          {e.actor}
                        </span>
                      ) : undefined
                    }
                    action={e.title}
                    description={e.desc}
                  />
                );
              })}
            </Timeline>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="timeline-feed" className="space-y-4">
        <div>
          <h2 id="timeline-feed" className="text-lg font-semibold text-foreground">
            {t('croissant.timeline.section.feed')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.timeline.section.feedDesc')}
          </p>
        </div>
        <LiveActivityFeed />
      </section>

      <section aria-labelledby="timeline-audit" className="space-y-4">
        <div>
          <h2 id="timeline-audit" className="text-lg font-semibold text-foreground">
            {t('croissant.timeline.section.audit')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.timeline.section.auditDesc')}
          </p>
        </div>
        <div className="space-y-3">
          <DataTable<AuditRow>
            columns={auditColumns}
            data={[...AUDIT]}
            getRowId={(r) => r.id}
            enableColumnFilters
            enableGlobalFilter={false}
            onRowClick={(row) => setAuditDetail(row)}
            pageSize={7}
          />
          {auditDetail !== null ? (
            <Card variant="outlined">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    {auditDetail.id} · {auditDetail.actor} {auditDetail.action} {auditDetail.target}
                  </CardTitle>
                  <CardDescription>{t('croissant.timeline.audit.detail')}</CardDescription>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setAuditDetail(null)}>
                  {t('croissant.timeline.audit.close')}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-md bg-surface-muted/40 p-3 text-xs">
                  {JSON.stringify(JSON.parse(auditDetail.json), null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="timeline-comments" className="space-y-4">
        <div>
          <h2 id="timeline-comments" className="text-lg font-semibold text-foreground">
            {t('croissant.timeline.section.comments')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.timeline.section.commentsDesc')}
          </p>
        </div>
        <CommentsThread />
      </section>

      <section aria-labelledby="timeline-chart" className="space-y-4">
        <div>
          <h2 id="timeline-chart" className="text-lg font-semibold text-foreground">
            {t('croissant.timeline.section.chart')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.timeline.section.chartDesc')}
          </p>
        </div>
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>{t('croissant.timeline.chart.title')}</CardTitle>
            <CardDescription>{t('croissant.timeline.chart.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid h-40 grid-cols-12 items-end gap-1"
              role="img"
              aria-label={t('croissant.timeline.chart.title')}
            >
              {CHART_SPARK.map((v, i) => {
                const max = Math.max(...CHART_SPARK);
                const h = Math.max(4, Math.round((v / max) * 100));
                const label = timeFmt.format(new Date(2026, 4, 14, i + 6));
                return (
                  <span
                    key={i}
                    aria-hidden="true"
                    title={label}
                    className="block rounded-t bg-info/70"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card variant="outlined">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{t('croissant.timeline.summary.title')}</CardTitle>
            <CardDescription>{t('croissant.timeline.summary.desc')}</CardDescription>
          </div>
          <Button leftIcon={<FileText className="h-4 w-4" />}>
            {t('croissant.timeline.summary.generate')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="xl" name="Grace Hopper" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">Grace Hopper</p>
              <p className="text-foreground-muted">{t('croissant.timeline.summary.mvp')}</p>
              <Badge variant="primary" size="sm">
                <Crown className="h-3 w-3" /> {t('croissant.timeline.summary.crown')}
              </Badge>
            </div>
            <IconButton aria-label={t('croissant.timeline.summary.share')} variant="ghost">
              <FileText className="h-4 w-4" />
            </IconButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
