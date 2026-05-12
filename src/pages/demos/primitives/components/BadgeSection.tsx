import { Badge, Separator } from '@/components/primitives';
import { Row, Section } from './Section';

export function BadgeSection() {
  return (
    <Section title="Badge">
      <Row label="Variant">
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="info">Info</Badge>
      </Row>
      <Separator className="my-1" />
      <Row label="With dot">
        <Badge variant="success" dot>Online</Badge>
        <Badge variant="warning" dot>Pending</Badge>
        <Badge variant="danger" dot>Failed</Badge>
      </Row>
      <Separator className="my-1" />
      <Row label="Size">
        <Badge variant="primary" size="sm">Small</Badge>
        <Badge variant="primary" size="md">Medium</Badge>
      </Row>
    </Section>
  );
}
