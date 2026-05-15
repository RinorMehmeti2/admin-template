import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent, ExampleBlock, Timeline, TimelineItem } from '@/components/data-display';
import { ago } from '../data';

const code = `<Timeline aria-label="comments">
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
          <Button size="sm" variant="outline">Reply</Button>
          <Badge variant="info" size="sm">question</Badge>
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
          <Button size="sm" variant="outline">Reply</Button>
          <Badge variant="success" size="sm">resolved</Badge>
        </div>
      </CardContent>
    </Card>
  </TimelineItem>
</Timeline>`;

export function CommentThreadCard() {
  return (
    <ExampleBlock
      title="Comment thread"
      description="Avatar markers and rich content slots (Card per item)."
      code={code}
    >
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
    </ExampleBlock>
  );
}
