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
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Card, CardContent } from '@/components/data-display/Card';
import { Timeline, TimelineItem, type TimelineVariant } from '@/components/data-display/Timeline';
import { DataTable, type ColumnDef, type Row } from '@/components/data-display/DataTable';
import { SlideInLeft, Stagger } from '@/components/motion';
import {
  ChartFrame,
  Chip,
  ComponentsUsedFooter,
  HeroCard,
  SceneHeader,
  StagedSection,
  StatRail,
  type StatRailItem,
} from '../_shared';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { CommentsThread } from './components/CommentsThread';

interface TimelineEntry {
  id: number;
  time: string;
  title: string;
  desc: string;
  icon: typeof Sparkles;
  variant: TimelineVariant;
  actor?: string;
}

const ENTRIES: ReadonlyArray<TimelineEntry> = [
  { id: 1, time: '2026-05-14T05:00:00', title: 'First bake', desc: 'Ovens warmed; first sourdough loaves in.', icon: Sun, variant: 'warning', actor: 'Linus' },
  { id: 2, time: '2026-05-14T06:30:00', title: 'Doors open', desc: 'Counter opens with fresh croissants and coffee.', icon: ShoppingBag, variant: 'default', actor: 'Margaret' },
  { id: 3, time: '2026-05-14T08:14:00', title: 'Morning rush', desc: 'Peak hour — 42 orders in 60 minutes.', icon: Coffee, variant: 'success', actor: 'Crew' },
  { id: 4, time: '2026-05-14T10:42:00', title: 'Second bake', desc: 'Almond + pain au chocolat trays in for 11 AM service.', icon: CookingPot, variant: 'warning', actor: 'Ada' },
  { id: 5, time: '2026-05-14T12:00:00', title: 'Lunch line', desc: 'Salad-and-baguette specials sell out by 1:15 PM.', icon: ShoppingBag, variant: 'info', actor: 'Margaret' },
  { id: 6, time: '2026-05-14T14:00:00', title: 'Wholesale pickup', desc: 'Le Bistro picks up the weekly wholesale order.', icon: PackageCheck, variant: 'info', actor: 'Alan' },
  { id: 7, time: '2026-05-14T15:18:00', title: 'New hire onboarded', desc: 'Edsger signs the apprenticeship paperwork.', icon: Sparkles, variant: 'success', actor: 'Manager' },
  { id: 8, time: '2026-05-14T17:00:00', title: 'Third bake', desc: 'Evening croissants for the takeaway crowd.', icon: CookingPot, variant: 'warning', actor: 'Ada' },
  { id: 9, time: '2026-05-14T18:30:00', title: 'MVP of the day', desc: 'Grace closes the prep list 20 min early.', icon: Crown, variant: 'success', actor: 'Grace' },
  { id: 10, time: '2026-05-14T19:00:00', title: 'Inventory check', desc: 'Pastry case reset; tomorrow\'s prep list drafted.', icon: FileText, variant: 'muted', actor: 'Linus' },
  { id: 11, time: '2026-05-14T19:45:00', title: 'Tip share', desc: 'Tips distributed across the shift.', icon: Coins, variant: 'success', actor: 'Manager' },
  { id: 12, time: '2026-05-14T20:00:00', title: 'Close up', desc: 'Last lights off; alarm armed; doors locked.', icon: Star, variant: 'muted', actor: 'Margaret' },
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
  { id: 'AU-001', ts: '07:01:12', actor: 'Linus', action: 'opened', target: 'Cash drawer', severity: 'info', json: '{"till":1,"opening":250}' },
  { id: 'AU-002', ts: '08:14:43', actor: 'Margaret', action: 'sold', target: 'Order #1041', severity: 'info', json: '{"order":1041,"items":3,"total":24.0}' },
  { id: 'AU-003', ts: '10:32:08', actor: 'Ada', action: 'refunded', target: 'Order #1039', severity: 'warning', json: '{"order":1039,"reason":"wrong item"}' },
  { id: 'AU-004', ts: '12:01:00', actor: 'System', action: 'alert', target: 'Oven C', severity: 'danger', json: '{"oven":"C","temp":228,"target":210}' },
  { id: 'AU-005', ts: '14:18:55', actor: 'Alan', action: 'dispatched', target: 'Le Bistro', severity: 'info', json: '{"customer":"Le Bistro","crates":4}' },
  { id: 'AU-006', ts: '16:42:30', actor: 'Margaret', action: 'reset', target: 'Counter cash', severity: 'info', json: '{"till":1,"variance":-2.4}' },
  { id: 'AU-007', ts: '18:55:01', actor: 'Grace', action: 'updated', target: 'Prep list', severity: 'info', json: '{"items":18,"changes":4}' },
];

const COMPONENTS = [
  'SceneHeader',
  'HeroCard',
  'StagedSection',
  'StatRail',
  'StatCard',
  'Timeline',
  'TimelineItem',
  'DataTable',
  'Card',
  'Badge',
  'Avatar',
  'Button',
  'IconButton',
  'ChartFrame',
  'SlideInLeft',
  'Stagger',
];

const SEVERITY_VARIANT: Record<AuditRow['severity'], 'info' | 'warning' | 'danger'> = {
  info: 'info',
  warning: 'warning',
  danger: 'danger',
};

export function TimelineActivityPage() {
  const { t, i18n } = useTranslation();
  const [auditDetail, setAuditDetail] = useState<AuditRow | null>(null);

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }),
    [i18n.language],
  );

  const stats: ReadonlyArray<StatRailItem> = [
    { id: 'orders', label: t('croissant.timeline.day.orders'), value: 312, delta: 4.2, deltaLabel: t('croissant.timeline.day.vsAvg'), icon: <ShoppingBag className="h-4 w-4" />, spark: [22, 36, 48, 42, 28, 22, 18, 14, 10, 8, 6, 4], tone: 'info' },
    { id: 'peak', label: t('croissant.timeline.day.peak'), value: 8, unit: 'AM', delta: 0, deltaLabel: t('croissant.timeline.day.vsAvg'), icon: <Sun className="h-4 w-4" />, spark: [2, 3, 5, 7, 8, 7, 5, 4, 3, 2], tone: 'warning' },
    { id: 'top', label: t('croissant.timeline.day.top'), value: 412, delta: 6.4, deltaLabel: t('croissant.timeline.day.vsAvg'), icon: <Crown className="h-4 w-4" />, spark: [60, 80, 110, 140, 120, 100, 90, 85, 80, 70, 60, 50], tone: 'success', accent: true },
    { id: 'refunds', label: t('croissant.timeline.day.refunds'), value: 3, delta: -1.2, deltaLabel: t('croissant.timeline.day.vsAvg'), icon: <RotateCw className="h-4 w-4" />, spark: [1, 0, 2, 1, 0, 0, 1, 0], tone: 'danger' },
    { id: 'customers', label: t('croissant.timeline.day.customers'), value: 247, delta: 5.1, deltaLabel: t('croissant.timeline.day.vsAvg'), icon: <Coffee className="h-4 w-4" />, spark: [10, 20, 30, 40, 30, 20, 18, 14, 10, 8, 6, 5], tone: 'primary' },
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

  const meta = (
    <>
      <Chip tone="info" dot>
        {t('croissant.timeline.meta.live')}
      </Chip>
      <Chip tone="warning">{t('croissant.timeline.meta.events', { n: 47 })}</Chip>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <SceneHeader
        tone="info"
        eyebrow={t('croissant.timeline.scene.eyebrow')}
        title={t('croissant.timeline.scene.title')}
        description={t('croissant.timeline.scene.description')}
        meta={meta}
      />

      <StagedSection
        tone="info"
        eyebrow={t('croissant.timeline.section.dayEyebrow')}
        title={t('croissant.timeline.section.day')}
        description={t('croissant.timeline.section.dayDesc')}
        headingId="timeline-day"
      >
        <StatRail items={stats} />
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.timeline.section.heroEyebrow')}
        title={t('croissant.timeline.section.hero')}
        description={t('croissant.timeline.section.heroDesc')}
        headingId="timeline-hero"
      >
        <Card variant="outlined">
          <CardContent>
            <SlideInLeft whenInView>
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
            </SlideInLeft>
          </CardContent>
        </Card>
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.timeline.section.feedEyebrow')}
        title={t('croissant.timeline.section.feed')}
        description={t('croissant.timeline.section.feedDesc')}
        headingId="timeline-feed"
      >
        <LiveActivityFeed />
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.timeline.section.auditEyebrow')}
        title={t('croissant.timeline.section.audit')}
        description={t('croissant.timeline.section.auditDesc')}
        headingId="timeline-audit"
      >
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
            <SlideInLeft>
              <Card variant="outlined" className="border-info/30">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-info">
                        {t('croissant.timeline.audit.detail')}
                      </p>
                      <h3 className="text-base font-semibold text-foreground">
                        {auditDetail.id} · {auditDetail.actor} {auditDetail.action} {auditDetail.target}
                      </h3>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setAuditDetail(null)}>
                      {t('croissant.timeline.audit.close')}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-md bg-surface-muted/40 p-3 text-xs">
                    {JSON.stringify(JSON.parse(auditDetail.json), null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </SlideInLeft>
          ) : null}
        </div>
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.timeline.section.commentsEyebrow')}
        title={t('croissant.timeline.section.comments')}
        description={t('croissant.timeline.section.commentsDesc')}
        headingId="timeline-comments"
      >
        <CommentsThread />
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.timeline.section.chartEyebrow')}
        title={t('croissant.timeline.section.chart')}
        description={t('croissant.timeline.section.chartDesc')}
        headingId="timeline-chart"
      >
        <ChartFrame
          tone="info"
          eyebrow={t('croissant.timeline.chart.eyebrow')}
          title={t('croissant.timeline.chart.title')}
          description={t('croissant.timeline.chart.desc')}
        >
          <div className="grid grid-cols-12 items-end gap-1 h-40" role="img" aria-label={t('croissant.timeline.chart.title')}>
            {stats[0]?.spark?.map((v, i) => {
              const max = Math.max(...(stats[0]?.spark ?? [1]));
              const h = Math.max(4, Math.round((v / max) * 100));
              const label = timeFmt.format(new Date(2026, 4, 14, i + 6));
              return (
                <Stagger key={i} animation="slide-in-up" stagger={30} className="contents">
                  <span
                    aria-hidden="true"
                    title={label}
                    className="block rounded-t bg-info/70"
                    style={{ height: `${h}%` }}
                  />
                </Stagger>
              );
            })}
          </div>
        </ChartFrame>
      </StagedSection>

      <HeroCard
        tone="info"
        eyebrow={t('croissant.timeline.summary.eyebrow')}
        title={t('croissant.timeline.summary.title')}
        description={t('croissant.timeline.summary.desc')}
        action={
          <Button leftIcon={<FileText className="h-4 w-4" />}>
            {t('croissant.timeline.summary.generate')}
          </Button>
        }
        illustration={
          <div className="flex items-center gap-4">
            <Avatar size="xl" name="Grace Hopper" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">Grace Hopper</p>
              <p className="text-foreground-muted">{t('croissant.timeline.summary.mvp')}</p>
              <Badge variant="primary" size="sm">
                <Crown className="h-3 w-3" /> {t('croissant.timeline.summary.crown')}
              </Badge>
            </div>
            <IconButton
              aria-label={t('croissant.timeline.summary.share')}
              variant="ghost"
            >
              <FileText className="h-4 w-4" />
            </IconButton>
          </div>
        }
      />

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
