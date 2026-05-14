import { CheckCircle2, GitMerge, XCircle } from 'lucide-react';
import { ExampleBlock, Timeline, TimelineItem } from '@/components/data-display';
import { ONE_DAY, ago } from '../data';

const code = `<Timeline groupBy="day" aria-label="deploys">
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
</Timeline>`;

export function DeploymentHistoryCard() {
  return (
    <ExampleBlock
      title="Deployment history"
      description="Grouped by day with sticky headers."
      code={code}
    >
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
    </ExampleBlock>
  );
}
