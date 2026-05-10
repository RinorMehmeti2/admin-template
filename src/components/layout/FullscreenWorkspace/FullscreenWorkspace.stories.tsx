import { useState } from 'react';
import {
  FullscreenWorkspace,
  WorkspaceCanvas,
  WorkspacePanel,
} from './FullscreenWorkspace';
import { Button } from '@/components/primitives/Button';

export default { title: 'Layout/FullscreenWorkspace', component: FullscreenWorkspace };

function Canvas() {
  return (
    <div className="grid h-full place-items-center text-sm text-foreground-subtle">
      <span>Canvas content (drag panels around me)</span>
    </div>
  );
}

export const TwoPanels = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      if (!open) {
        return (
          <div className="p-6">
            <Button onClick={() => setOpen(true)}>Open workspace</Button>
          </div>
        );
      }
      return (
        <FullscreenWorkspace>
          <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-surface px-3 text-xs">
            <span className="font-semibold">Untitled scene</span>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Exit
            </Button>
          </header>
          <WorkspaceCanvas>
            <Canvas />
            <WorkspacePanel title="Layers" defaultPosition={{ x: 16, y: 16 }} width={220}>
              <ul className="space-y-1">
                <li className="rounded px-2 py-1 hover:bg-surface-muted">Background</li>
                <li className="rounded px-2 py-1 hover:bg-surface-muted">Hero text</li>
                <li className="rounded px-2 py-1 hover:bg-surface-muted">CTA button</li>
              </ul>
            </WorkspacePanel>
            <WorkspacePanel title="Properties" defaultPosition={{ x: 540, y: 16 }} width={260}>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt>x</dt>
                  <dd>120</dd>
                </div>
                <div className="flex justify-between">
                  <dt>y</dt>
                  <dd>40</dd>
                </div>
                <div className="flex justify-between">
                  <dt>opacity</dt>
                  <dd>1.0</dd>
                </div>
              </dl>
            </WorkspacePanel>
          </WorkspaceCanvas>
        </FullscreenWorkspace>
      );
    }
    return <Demo />;
  },
};
