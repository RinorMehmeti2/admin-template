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
import { Card, CardContent } from '@/components/data-display/Card';
import { Timeline, TimelineItem } from './Timeline';

export default { title: 'Data Display/Timeline', component: Timeline };

const NOW = new Date();
function ago(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60_000);
}

/* -------------------------------------------------------------------------- */
/*  Simple audit log                                                          */
/* -------------------------------------------------------------------------- */

export const AuditLog = {
  render: () => (
    <div className="max-w-xl">
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
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Comment thread with avatars + rich content                                */
/* -------------------------------------------------------------------------- */

export const CommentThread = {
  render: () => (
    <div className="max-w-xl">
      <Timeline aria-label="comments">
        <TimelineItem
          timestamp={ago(60)}
          icon={<Avatar name="Ada Lovelace" size="xs" />}
          title="Ada Lovelace"
        >
          <Card variant="outlined">
            <CardContent className="p-4">
              <p className="text-sm">
                Can we sanity-check the migration on staging before rolling out? The last release
                hit a snag with the index rebuild.
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
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Build pipeline (horizontal)                                               */
/* -------------------------------------------------------------------------- */

export const BuildPipeline = {
  render: () => (
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
  ),
};

/* -------------------------------------------------------------------------- */
/*  Deploy history grouped by day                                             */
/* -------------------------------------------------------------------------- */

const ONE_DAY = 24 * 60;

export const DeploymentHistoryByDay = {
  render: () => (
    <div className="max-w-xl">
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
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Plain dot markers (no icons)                                              */
/* -------------------------------------------------------------------------- */

export const PlainDots = {
  render: () => (
    <div className="max-w-md">
      <Timeline aria-label="status">
        <TimelineItem timestamp={ago(2)} variant="success" title="Order placed" />
        <TimelineItem timestamp={ago(15)} variant="info" title="Payment received" />
        <TimelineItem timestamp={ago(45)} variant="warning" title="Awaiting fulfillment" />
        <TimelineItem timestamp={ago(120)} variant="muted" title="Shipped" />
      </Timeline>
    </div>
  ),
};
