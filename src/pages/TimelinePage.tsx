import {
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  GitMerge,
  MessageSquare,
  Package,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Timeline,
  TimelineItem,
} from '@/components/data-display';

const NOW = new Date();
function ago(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60_000);
}
const ONE_DAY = 24 * 60;

export function TimelinePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="mt-1 text-foreground-muted">
          Vertical and horizontal activity feeds — audit logs, comment threads, build pipelines,
          and deployment history.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>Compact rows with actor + action shorthand.</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline aria-label="audit log">
              <TimelineItem
                timestamp={ago(2)}
                variant="success"
                icon={<UserPlus className="h-4 w-4" />}
                actor="Ada Lovelace"
                action="invited Bob Marley to the workspace"
              />
              <TimelineItem
                timestamp={ago(38)}
                variant="info"
                icon={<MessageSquare className="h-4 w-4" />}
                actor="Cher"
                action="commented on issue #482"
                description="“Looks good — shipping after the freeze.”"
              />
              <TimelineItem
                timestamp={ago(180)}
                variant="warning"
                icon={<AlertTriangle className="h-4 w-4" />}
                actor="Diego"
                action="downgraded the plan to Team"
              />
              <TimelineItem
                timestamp={ago(60 * 26)}
                variant="danger"
                icon={<XCircle className="h-4 w-4" />}
                actor="Eve"
                action="revoked an API key"
              />
            </Timeline>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Comment thread</CardTitle>
            <CardDescription>Avatar markers and rich content slots (Card per item).</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline aria-label="comments">
              <TimelineItem
                timestamp={ago(60)}
                icon={<Avatar name="Ada Lovelace" size="xs" />}
                title="Ada Lovelace"
              >
                <Card variant="outlined">
                  <CardContent className="p-4">
                    <p className="text-sm">
                      Can we sanity-check the migration on staging before rolling out? The last
                      release hit a snag with the index rebuild.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                      <Badge variant="info" size="sm">
                        question
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TimelineItem>
              <TimelineItem
                timestamp={ago(40)}
                icon={<Avatar name="Bob Marley" size="xs" />}
                title="Bob Marley"
              >
                <Card variant="outlined">
                  <CardContent className="p-4">
                    <p className="text-sm">Already deployed to staging — green build, no drift.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                      <Badge variant="success" size="sm">
                        resolved
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Build pipeline</CardTitle>
          <CardDescription>Horizontal orientation — left-to-right step ladder.</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline orientation="horizontal" aria-label="pipeline" className="px-4 py-2">
            <TimelineItem
              timestamp={ago(15)}
              variant="success"
              icon={<GitCommit className="h-4 w-4" />}
              title="Commit"
              description="abc123"
            />
            <TimelineItem
              timestamp={ago(12)}
              variant="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Build"
              description="42s"
            />
            <TimelineItem
              timestamp={ago(8)}
              variant="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Tests"
              description="218 passed"
            />
            <TimelineItem
              timestamp={ago(2)}
              variant="warning"
              icon={<Package className="h-4 w-4" />}
              title="Deploy"
              description="rolling…"
            />
            <TimelineItem
              timestamp={ago(0)}
              variant="muted"
              icon={<GitMerge className="h-4 w-4" />}
              title="Verify"
              description="pending"
            />
          </Timeline>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Deployment history</CardTitle>
          <CardDescription>Grouped by day with sticky headers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline groupBy="day" aria-label="deploys">
            <TimelineItem
              timestamp={ago(20)}
              variant="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              actor="ci-bot"
              action="deployed v2.4.1 to production"
            />
            <TimelineItem
              timestamp={ago(180)}
              variant="danger"
              icon={<XCircle className="h-4 w-4" />}
              actor="ci-bot"
              action="rolled back v2.4.0 (smoke test failure)"
            />
            <TimelineItem
              timestamp={ago(ONE_DAY + 60)}
              variant="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              actor="ci-bot"
              action="deployed v2.4.0 to production"
            />
            <TimelineItem
              timestamp={ago(ONE_DAY + 320)}
              variant="info"
              icon={<GitMerge className="h-4 w-4" />}
              actor="Ada"
              action="merged #1287 into main"
            />
            <TimelineItem
              timestamp={ago(ONE_DAY * 2 + 90)}
              variant="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              actor="ci-bot"
              action="deployed v2.3.9 to production"
            />
          </Timeline>
        </CardContent>
      </Card>
    </div>
  );
}
