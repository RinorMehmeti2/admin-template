import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import {
  FullscreenWorkspace,
  WorkspaceCanvas,
  WorkspacePanel,
} from '@/components/layout/FullscreenWorkspace';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { IntroView, LayersPanelBody, PropertiesPanelBody } from './components';
import { INITIAL_LAYERS } from './data';
import type { Layer } from './model';

export function WorkspaceDemoPage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [layers, setLayers] = useState<ReadonlyArray<Layer>>(INITIAL_LAYERS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_LAYERS[1]!.id);

  const toggle = (id: string, key: 'visible' | 'locked') => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: !l[key] } : l)));
  };
  const selected = layers.find((l) => l.id === selectedId) ?? layers[0]!;

  if (!open) {
    return <IntroView onOpen={() => setOpen(true)} />;
  }

  return (
    <FullscreenWorkspace>
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-surface px-3 text-xs">
        <span className="font-semibold tracking-tight">Untitled scene</span>
        <IconButton
          aria-label="Exit workspace"
          variant="ghost"
          size="sm"
          className="h-7 w-7"
          onClick={() => {
            setOpen(false);
            navigate('/workspace');
          }}
        >
          <X className="h-3.5 w-3.5" />
        </IconButton>
      </header>
      <WorkspaceCanvas>
        {/* Faux design canvas. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border-strong)_1px,transparent_0)] [background-size:24px_24px] opacity-40"
        />
        <div className="relative grid h-full place-items-center">
          <div className="rounded-md border border-border bg-surface px-6 py-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold">Hero text</h2>
            <p className="mt-1 text-sm text-foreground-muted">A single mock element.</p>
            <Button className="mt-4" size="sm">
              Call to action
            </Button>
          </div>
        </div>

        <WorkspacePanel title="Layers" defaultPosition={{ x: 16, y: 16 }} width={240}>
          <LayersPanelBody
            layers={layers}
            onToggle={toggle}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        </WorkspacePanel>

        <WorkspacePanel title="Properties" defaultPosition={{ x: 740, y: 16 }} width={260}>
          <PropertiesPanelBody layer={selected} />
        </WorkspacePanel>
      </WorkspaceCanvas>
    </FullscreenWorkspace>
  );
}
