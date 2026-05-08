import type { ReactNode } from 'react';
import { ChevronRight, Plus, Search, Settings, Trash2 } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  IconButton,
  Kbd,
  Separator,
  Skeleton,
  Spinner,
} from '@/components/primitives';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="rounded-lg border border-border bg-surface p-6">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-4 py-2 first:pt-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function PrimitivesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Primitives</h1>
        <p className="mt-1 text-foreground-muted">
          Foundation components — Button, IconButton, Badge, Avatar, Spinner, Skeleton, Kbd, Separator.
        </p>
      </header>

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

      <Section title="IconButton">
        <Row label="Variant">
          <IconButton aria-label="Add" variant="primary">
            <Plus className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="Settings" variant="secondary">
            <Settings className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="Search" variant="ghost">
            <Search className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="More" variant="outline">
            <Settings className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="Delete" variant="danger">
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </Row>
        <Separator className="my-1" />
        <Row label="Size">
          <IconButton aria-label="sm" size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton aria-label="md" size="md" variant="outline">
            <Plus className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="lg" size="lg" variant="outline">
            <Plus className="h-5 w-5" />
          </IconButton>
        </Row>
      </Section>

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

      <Section title="Spinner & Skeleton">
        <Row label="Spinner">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner className="text-primary" />
          <Spinner className="text-danger" />
        </Row>
        <Separator className="my-1" />
        <Row label="Skeleton">
          <div className="w-full max-w-sm space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Row>
      </Section>

      <Section title="Kbd & Separator">
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
    </div>
  );
}
