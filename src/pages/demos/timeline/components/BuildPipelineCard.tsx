import { CheckCircle2, GitCommit, GitMerge, Package } from 'lucide-react';
import { ExampleBlock, Timeline, TimelineItem } from '@/components/data-display';
import { ago } from '../data';

const code = `<Timeline orientation="horizontal" aria-label="pipeline" className="px-4 py-2">
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
</Timeline>`;

export function BuildPipelineCard() {
  return (
    <ExampleBlock
      title="Build pipeline"
      description="Horizontal orientation — left-to-right step ladder."
      code={code}
    >
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
    </ExampleBlock>
  );
}
