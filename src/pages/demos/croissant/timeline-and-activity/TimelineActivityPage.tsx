import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Coins, Smile } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Skeleton } from '@/components/primitives/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
import { List, ListItem } from '@/components/data-display/List';
import { Progress } from '@/components/feedback/Progress';
import { Timeline, TimelineItem, type TimelineVariant } from '@/components/data-display/Timeline';
import { ComponentsUsedFooter, SectionHeader } from '../_shared';

type EventKind = 'created' | 'delivered' | 'refunded' | 'comment' | 'statusChange';

interface ActivityEvent {
  id: number;
  kind: EventKind;
  name: string;
  orderId: number;
  status?: string;
  at: Date;
  variant: TimelineVariant;
}

const NOW = Date.now();
const minutesAgo = (n: number) => new Date(NOW - n * 60_000);

const EVENTS: ReadonlyArray<ActivityEvent> = [
  { id: 1, kind: 'created', name: 'Ada Lovelace', orderId: 1042, at: minutesAgo(5), variant: 'default' },
  { id: 2, kind: 'statusChange', name: 'Grace Hopper', orderId: 1041, status: 'pending', at: minutesAgo(18), variant: 'info' },
  { id: 3, kind: 'delivered', name: 'Linus Torvalds', orderId: 1040, at: minutesAgo(45), variant: 'success' },
  { id: 4, kind: 'refunded', name: 'Margaret Hamilton', orderId: 1039, at: minutesAgo(75), variant: 'danger' },
  { id: 5, kind: 'comment', name: 'Alan Turing', orderId: 1038, at: minutesAgo(120), variant: 'muted' },
  { id: 6, kind: 'created', name: 'Edsger Dijkstra', orderId: 1037, at: minutesAgo(180), variant: 'default' },
  { id: 7, kind: 'statusChange', name: 'Hedy Lamarr', orderId: 1036, status: 'paid', at: minutesAgo(240), variant: 'success' },
  { id: 8, kind: 'comment', name: 'Donald Knuth', orderId: 1035, at: minutesAgo(360), variant: 'muted' },
];

const COMMENTS = [
  { id: 1, name: 'Ada Lovelace', text: 'Can we have extra butter on the croissants?' },
  { id: 2, name: 'Grace Hopper', text: 'Big order coming tomorrow — please bake fresh.' },
  { id: 3, name: 'Linus Torvalds', text: 'Delivery showed up early. Nice.' },
  { id: 4, name: 'Hedy Lamarr', text: 'Loving the new kouign-amann.' },
];

const COMPONENTS = [
  'Timeline',
  'TimelineItem',
  'List',
  'Card',
  'Stat',
  'Progress',
  'Avatar',
  'Badge',
  'Skeleton',
];

export function TimelineActivityPage() {
  const { t } = useTranslation();
  const [commentsLoading, setCommentsLoading] = useState(true);

  const eventBadge = (kind: EventKind) => {
    switch (kind) {
      case 'created':
        return <Badge variant="info" size="sm">{t('croissant.timeline.event.tag.paid')}</Badge>;
      case 'delivered':
        return (
          <Badge variant="success" size="sm">{t('croissant.timeline.event.tag.delivered')}</Badge>
        );
      case 'refunded':
        return <Badge variant="danger" size="sm">{t('croissant.timeline.event.tag.refunded')}</Badge>;
      case 'comment':
        return <Badge variant="neutral" size="sm">{t('croissant.timeline.event.tag.comment')}</Badge>;
      case 'statusChange':
        return <Badge variant="warning" size="sm">{t('croissant.timeline.event.tag.status')}</Badge>;
    }
  };

  const eventAction = (ev: ActivityEvent): string => {
    const id = ev.orderId;
    switch (ev.kind) {
      case 'created':
        return t('croissant.timeline.event.created', { name: '', id });
      case 'delivered':
        return t('croissant.timeline.event.delivered', { name: '', id });
      case 'refunded':
        return t('croissant.timeline.event.refunded', { name: '', id });
      case 'comment':
        return t('croissant.timeline.event.comment', { name: '', id });
      case 'statusChange':
        return t('croissant.timeline.event.statusChange', {
          name: '',
          id,
          status: ev.status ?? '',
        });
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => setCommentsLoading(false), 1000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={t('croissant.timeline.title')}
        description={t('croissant.timeline.subtitle')}
      />

      <Card variant="outlined">
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {t('croissant.timeline.progress.label')}
            </p>
            <Badge variant="primary" size="sm">64%</Badge>
          </div>
          <Progress value={64} label={t('croissant.timeline.progress.label')} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2" aria-labelledby="feed-heading">
          <SectionHeader
            tone="primary"
            eyebrow={t('croissant.timeline.section.feedEyebrow')}
            title={<span id="feed-heading">{t('croissant.timeline.section.feed')}</span>}
          />
          <Card variant="outlined">
            <CardContent>
              <Timeline>
                {EVENTS.map((ev) => (
                  <TimelineItem
                    key={ev.id}
                    timestamp={ev.at}
                    variant={ev.variant}
                    actor={
                      <span className="inline-flex items-center gap-2">
                        <Avatar size="xs" name={ev.name} />
                        <span className="font-medium">{ev.name}</span>
                      </span>
                    }
                    action={eventAction(ev)}
                    description={eventBadge(ev.kind)}
                  />
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <div className="space-y-4">
            <SectionHeader
              tone="info"
              eyebrow={t('croissant.timeline.section.commentsEyebrow')}
              title={t('croissant.timeline.section.comments')}
            />
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>{t('croissant.timeline.comments.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <ul className="space-y-3" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-1/3" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <List variant="divided">
                    {COMMENTS.map((c) => (
                      <ListItem
                        key={c.id}
                        leading={<Avatar size="sm" name={c.name} />}
                        primary={c.name}
                        secondary={c.text}
                      />
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <SectionHeader
              tone="success"
              eyebrow={t('croissant.timeline.section.statsEyebrow')}
              title={t('croissant.timeline.section.stats')}
            />
            <Card variant="outlined">
              <CardContent className="grid grid-cols-1 gap-4">
                <Stat
                  variant="compact"
                  label={t('croissant.timeline.stat.openOrders')}
                  value="12"
                  delta={2}
                  icon={<Coins className="h-5 w-5" />}
                />
                <Stat
                  variant="compact"
                  label={t('croissant.timeline.stat.avgTime')}
                  value="18 min"
                  delta="-3 min"
                  icon={<Clock className="h-5 w-5" />}
                />
                <Stat
                  variant="compact"
                  label={t('croissant.timeline.stat.satisfaction')}
                  value="4.8 / 5"
                  delta={0.2}
                  icon={<Smile className="h-5 w-5" />}
                />
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
