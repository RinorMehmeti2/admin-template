import { CheckCircle2, GitCommit, GitMerge, Package } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Timeline,
  TimelineItem,
} from '@/components/data-display';
import { ago } from '../data';

export function BuildPipelineCard() {
  return (
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
  );
}
