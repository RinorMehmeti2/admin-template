import { CardFooter, ExampleBlock, List, ListItem, Stat } from '@/components/data-display';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Separator } from '@/components/primitives/Separator';
import { ACTIVITY, QUICK_STATS } from '../data';

const activityCode = `<List variant="divided" className="border-t border-border">
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
</List>`;

const snapshotCode = `<CardContent className="space-y-3">
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
  <Button variant="link" size="sm">Refresh</Button>
</CardFooter>`;

export function ActivityAndSnapshot() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ExampleBlock
        title="Recent activity"
        description="Last 4 events across your workspace"
        code={activityCode}
        className="lg:col-span-2"
      >
        <List variant="divided" className="-mx-6 -mb-6 border-t border-border">
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
      </ExampleBlock>

      <ExampleBlock title="Live snapshot" description="Real-time pulse" code={snapshotCode}>
        <div className="space-y-3">
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
        </div>
        <CardFooter className="-mx-6 -mb-6 mt-4 justify-between border-t border-border">
          <span className="text-xs text-foreground-subtle">Updated just now</span>
          <Button variant="link" size="sm">
            Refresh
          </Button>
        </CardFooter>
      </ExampleBlock>
    </section>
  );
}
