import { Kbd, Separator } from '@/components/primitives';
import { Row, Section } from './Section';

const CODE = `<Row label="Kbd">
  <span className="text-sm text-foreground-muted">
    Open palette with <Kbd>⌘</Kbd> + <Kbd>K</Kbd>, save with <Kbd>⌘</Kbd> + <Kbd>S</Kbd>.
  </span>
</Row>
<Separator className="my-1" />
<Row label="Separator">
  <div className="flex h-6 items-center gap-3">
    <span className="text-sm">Left</span>
    <Separator orientation="vertical" />
    <span className="text-sm">Middle</span>
    <Separator orientation="vertical" />
    <span className="text-sm">Right</span>
  </div>
</Row>`;

export function KbdSeparatorSection() {
  return (
    <Section title="Kbd & Separator" code={CODE}>
      <Row label="Kbd">
        <span className="text-sm text-foreground-muted">
          Open palette with <Kbd>⌘</Kbd> + <Kbd>K</Kbd>, save with <Kbd>⌘</Kbd> + <Kbd>S</Kbd>.
        </span>
      </Row>
      <Separator className="my-1" />
      <Row label="Separator">
        <div className="flex h-6 items-center gap-3">
          <span className="text-sm">Left</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Middle</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Right</span>
        </div>
      </Row>
    </Section>
  );
}
