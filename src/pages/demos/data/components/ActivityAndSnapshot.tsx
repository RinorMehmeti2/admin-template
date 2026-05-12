import { ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  List,
  ListItem,
  Stat,
} from '@/components/data-display';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Separator } from '@/components/primitives/Separator';
import { ACTIVITY, QUICK_STATS } from '../data';

export function ActivityAndSnapshot() {
  return (
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
  );
}
