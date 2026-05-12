import { Avatar, Separator } from '@/components/primitives';
import { Row, Section } from './Section';

export function AvatarSection() {
  return (
    <Section title="Avatar">
      <Row label="Sizes">
        <Avatar name="Ada Lovelace" size="xs" />
        <Avatar name="Ada Lovelace" size="sm" />
        <Avatar name="Ada Lovelace" size="md" />
        <Avatar name="Ada Lovelace" size="lg" />
        <Avatar name="Ada Lovelace" size="xl" />
      </Row>
      <Separator className="my-1" />
      <Row label="Initials">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Bob Marley" />
        <Avatar name="Cher" />
        <Avatar name="Diego Velazquez" />
        <Avatar name="Eve" />
      </Row>
      <Separator className="my-1" />
      <Row label="Status">
        <Avatar name="Online User" status="online" />
        <Avatar name="Away User" status="away" />
        <Avatar name="Busy User" status="busy" />
        <Avatar name="Offline User" status="offline" />
      </Row>
    </Section>
  );
}
