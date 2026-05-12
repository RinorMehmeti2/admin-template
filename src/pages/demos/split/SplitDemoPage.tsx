import { useState } from 'react';
import { SplitLayout } from '@/components/layout/SplitLayout';
import { MessageDetail, MessageList } from './components';
import { MESSAGES } from './data';

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
