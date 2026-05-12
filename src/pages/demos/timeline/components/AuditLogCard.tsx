import { AlertTriangle, MessageSquare, UserPlus, XCircle } from 'lucide-react';
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

export function AuditLogCard() {
  return (
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
  );
}
