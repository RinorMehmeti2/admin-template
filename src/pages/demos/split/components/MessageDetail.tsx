import { Avatar } from '@/components/primitives/Avatar';
import type { Message } from '../model';

export function MessageDetail({ message }: { message: Message }) {
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
