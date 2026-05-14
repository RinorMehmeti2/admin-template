import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Coffee, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardContent } from '@/components/data-display/Card';
import { SlideInDown } from '@/components/motion';

interface FeedEvent {
  id: number;
  kind: 'order' | 'fulfilled' | 'comment' | 'bake';
  name: string;
  detail: string;
  at: number;
  isNew: boolean;
}

const SEED: FeedEvent[] = [
  {
    id: 1,
    kind: 'order',
    name: 'Ada Lovelace',
    detail: '3 × croissant, 1 × latte',
    at: Date.now() - 30_000,
    isNew: false,
  },
  {
    id: 2,
    kind: 'fulfilled',
    name: 'Grace Hopper',
    detail: 'Order #1041 marked fulfilled',
    at: Date.now() - 90_000,
    isNew: false,
  },
  {
    id: 3,
    kind: 'comment',
    name: 'Linus Torvalds',
    detail: 'Said the sourdough was great',
    at: Date.now() - 180_000,
    isNew: false,
  },
  {
    id: 4,
    kind: 'bake',
    name: 'Margaret Hamilton',
    detail: 'Pulled tray of pain au chocolat',
    at: Date.now() - 240_000,
    isNew: false,
  },
];

const KIND_META: Record<FeedEvent['kind'], { icon: typeof Bell; tint: string }> = {
  order: { icon: ShoppingBag, tint: 'bg-primary/15 text-primary' },
  fulfilled: { icon: CheckCircle, tint: 'bg-success/15 text-success' },
  comment: { icon: Bell, tint: 'bg-info/15 text-info' },
  bake: { icon: Coffee, tint: 'bg-warning/15 text-warning' },
};

const RANDOM_BAKERS = ['Hedy Lamarr', 'Donald Knuth', 'Edsger Dijkstra', 'Alan Turing'];
const RANDOM_DETAILS = [
  'Started new bake — almond croissants',
  'Tip placed at the counter',
  'Reviewed shift schedule',
  'Picked up coffee order',
];

let nextId = SEED.length + 1;

export function LiveActivityFeed() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<ReadonlyArray<FeedEvent>>(SEED);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const kinds: FeedEvent['kind'][] = ['order', 'fulfilled', 'comment', 'bake'];
      const k = kinds[Math.floor(Math.random() * kinds.length)] as FeedEvent['kind'];
      const ev: FeedEvent = {
        id: nextId++,
        kind: k,
        name: RANDOM_BAKERS[Math.floor(Math.random() * RANDOM_BAKERS.length)] as string,
        detail: RANDOM_DETAILS[Math.floor(Math.random() * RANDOM_DETAILS.length)] as string,
        at: Date.now(),
        isNew: true,
      };
      setEvents((list) => [ev, ...list.map((e) => ({ ...e, isNew: false }))].slice(0, 12));
    }, 8000);
    const refresh = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(refresh);
    };
  }, []);

  const timeFmt = (at: number) => {
    const seconds = Math.max(0, Math.floor((nowTick - at) / 1000));
    if (seconds < 60) return t('croissant.timeline.feed.secAgo', { n: seconds });
    return t('croissant.timeline.feed.minAgo', { n: Math.floor(seconds / 60) });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <ul className="space-y-2" aria-live="polite">
          {events.map((ev) => {
            const meta = KIND_META[ev.kind];
            const Icon = meta.icon;
            const content = (
              <li
                key={ev.id}
                className={cn(
                  'flex items-start gap-3 rounded-md border border-transparent px-2 py-2 transition-colors',
                  ev.isNew && 'border-warning/30 bg-warning/10',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    meta.tint,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar size="xs" name={ev.name} />
                      <span className="font-medium text-foreground">{ev.name}</span>
                    </span>
                    <span className="text-foreground-muted">{ev.detail}</span>
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {timeFmt(ev.at)} ·{' '}
                    {new Date(ev.at).toLocaleTimeString(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {ev.isNew ? (
                  <Badge variant="warning" size="sm">
                    {t('croissant.timeline.feed.new')}
                  </Badge>
                ) : null}
              </li>
            );
            return ev.isNew ? <SlideInDown key={ev.id}>{content}</SlideInDown> : content;
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
