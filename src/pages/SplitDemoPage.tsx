import { useState } from 'react';
import { Inbox, Search, Star } from 'lucide-react';
import { SplitLayout } from '@/components/layout/SplitLayout';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/forms/Input';

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  unread: boolean;
  starred: boolean;
  receivedAt: string;
}

const MESSAGES: ReadonlyArray<Message> = [
  {
    id: 'm-1',
    from: 'Ada Lovelace',
    subject: 'Re: Q2 ramp plan',
    preview: 'Sharing the engineering capacity by team for the upcoming quarter…',
    body: 'Hi team,\n\nSharing the engineering capacity by team for the upcoming quarter. Headcount allocations are tentative until we close the open roles in security and platform.\n\nLet me know if anything looks off.\n\nAda',
    unread: true,
    starred: false,
    receivedAt: '10:42',
  },
  {
    id: 'm-2',
    from: 'Grace Hopper',
    subject: 'Compiler review on Friday',
    preview: 'Lining up the agenda. Want to walk through the bytecode-cache patch first…',
    body: 'Hi all,\n\nLining up the agenda. Want to walk through the bytecode-cache patch first; cherry-picked the diff into the review branch.\n\nGrace',
    unread: true,
    starred: true,
    receivedAt: '09:18',
  },
  {
    id: 'm-3',
    from: 'Linus Torvalds',
    subject: 'kernel ci is flaky again',
    preview: 'Dropping the run logs here — looks like the same race we saw last month…',
    body: 'kernel ci is flaky again — same race condition we saw last month. logs attached.',
    unread: false,
    starred: false,
    receivedAt: 'Yesterday',
  },
  {
    id: 'm-4',
    from: 'Margaret Hamilton',
    subject: 'Apollo postmortem draft',
    preview: 'Initial draft attached for review. Two open questions about the timing analysis…',
    body: 'Initial draft attached. Two open questions about the timing analysis — I can pull more telemetry if needed.',
    unread: false,
    starred: true,
    receivedAt: 'Yesterday',
  },
  {
    id: 'm-5',
    from: 'Donald Knuth',
    subject: 'TAOCP volume 4B feedback',
    preview: 'Thank you for the careful read. Most of the suggestions match my own marginalia…',
    body: 'Thank you for the careful read. Most of the suggestions match my own marginalia. I will integrate the corrections in the next pass.',
    unread: false,
    starred: false,
    receivedAt: 'Mon',
  },
  {
    id: 'm-6',
    from: 'Barbara Liskov',
    subject: 'CLU type-system question',
    preview: 'Following up on the parametric polymorphism discussion from the workshop…',
    body: 'Following up on the parametric polymorphism discussion from the workshop. Sending a small write-up next week.',
    unread: false,
    starred: false,
    receivedAt: 'Mon',
  },
];

function MessageList({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3">
        <Inbox className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
        <span className="text-sm font-semibold">Inbox</span>
        <Badge variant="primary" size="sm">
          {MESSAGES.filter((m) => m.unread).length}
        </Badge>
      </div>
      <div className="shrink-0 border-b border-border p-2">
        <Input
          inputSize="sm"
          placeholder="Search mail…"
          leftIcon={<Search className="h-3.5 w-3.5" />}
          aria-label="Search mail"
        />
      </div>
      <ul className="flex-1 overflow-auto">
        {MESSAGES.map((m) => {
          const isSelected = m.id === selectedId;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                aria-current={isSelected ? 'true' : undefined}
                className={
                  'flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset' +
                  (isSelected ? ' bg-surface-muted' : '')
                }
              >
                <Avatar size="sm" name={m.from} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={
                        'min-w-0 flex-1 truncate text-sm ' +
                        (m.unread ? 'font-semibold text-foreground' : 'text-foreground-muted')
                      }
                    >
                      {m.from}
                    </p>
                    {m.starred ? (
                      <Star className="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Starred" />
                    ) : null}
                    <span className="shrink-0 text-xs text-foreground-subtle">{m.receivedAt}</span>
                  </div>
                  <p className="truncate text-sm text-foreground">{m.subject}</p>
                  <p className="truncate text-xs text-foreground-muted">{m.preview}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MessageDetail({ message }: { message: Message }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight">{message.subject}</h1>
        <div className="flex items-center gap-3">
          <Avatar size="sm" name={message.from} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{message.from}</p>
            <p className="text-xs text-foreground-muted">{message.receivedAt}</p>
          </div>
        </div>
      </header>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">
        {message.body}
      </pre>
    </div>
  );
}

export function SplitDemoPage() {
  const [selectedId, setSelectedId] = useState(MESSAGES[0]!.id);
  const message = MESSAGES.find((m) => m.id === selectedId) ?? MESSAGES[0]!;

  return (
    <div className="-m-8 h-[calc(100vh-3.5rem)]">
      <SplitLayout
        persistKey="demo-split-inbox"
        defaultLeftWidth={320}
        minLeftWidth={240}
        maxLeftWidth={520}
        left={<MessageList selectedId={selectedId} onSelect={setSelectedId} />}
        right={<MessageDetail message={message} />}
      />
    </div>
  );
}
