import { useState } from 'react';
import { SplitLayout } from './SplitLayout';
import { Button } from '@/components/primitives/Button';

export default { title: 'Layout/SplitLayout', component: SplitLayout };

function LeftList() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-3 text-sm font-semibold">Inbox</header>
      <ul className="flex-1 overflow-auto">
        {Array.from({ length: 18 }).map((_, i) => (
          <li
            key={i}
            className="cursor-pointer border-b border-border px-4 py-3 text-sm hover:bg-surface-muted"
          >
            <p className="font-medium text-foreground">Subject line {i + 1}</p>
            <p className="text-foreground-muted">Lorem ipsum dolor sit amet.</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Detail() {
  return (
    <div className="space-y-3 p-6">
      <h2 className="text-lg font-semibold tracking-tight">Subject line 1</h2>
      <p className="text-sm text-foreground-muted">From: ada@example.com — 2026-05-09</p>
      <p className="text-sm text-foreground">
        The detail pane fills whatever the left pane leaves behind. Drag the divider, focus it and
        press the arrow keys, or click the chevron to collapse.
      </p>
    </div>
  );
}

export const Default = {
  render: () => (
    <div className="h-[480px] overflow-hidden rounded-md border border-border">
      <SplitLayout left={<LeftList />} right={<Detail />} />
    </div>
  ),
};

export const Persisted = {
  render: () => (
    <div className="h-[480px] overflow-hidden rounded-md border border-border">
      <SplitLayout
        persistKey="story-split-1"
        defaultLeftWidth={280}
        left={<LeftList />}
        right={<Detail />}
      />
    </div>
  ),
};

export const ControlledCollapse = {
  render: () => {
    function Demo() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <div className="space-y-3">
          <Button size="sm" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? 'Expand' : 'Collapse'} from outside
          </Button>
          <div className="h-[420px] overflow-hidden rounded-md border border-border">
            <SplitLayout
              collapsed={collapsed}
              onCollapsedChange={setCollapsed}
              left={<LeftList />}
              right={<Detail />}
            />
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};

export const NotResizable = {
  render: () => (
    <div className="h-[420px] overflow-hidden rounded-md border border-border">
      <SplitLayout resizable={false} left={<LeftList />} right={<Detail />} />
    </div>
  ),
};
