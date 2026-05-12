import { ChevronRight, Plus } from 'lucide-react';
import { Button, Separator } from '@/components/primitives';
import { Row, Section } from './Section';

export function ButtonSection() {
  return (
    <Section title="Button">
      <Row label="Variant">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="link">Link</Button>
      </Row>
      <Separator className="my-1" />
      <Row label="Size">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Row>
      <Separator className="my-1" />
      <Row label="With icon">
        <Button leftIcon={<Plus className="h-4 w-4" />}>Create</Button>
        <Button rightIcon={<ChevronRight className="h-4 w-4" />}>Continue</Button>
      </Row>
      <Separator className="my-1" />
      <Row label="State">
        <Button isLoading>Saving</Button>
        <Button disabled>Disabled</Button>
      </Row>
    </Section>
  );
}
