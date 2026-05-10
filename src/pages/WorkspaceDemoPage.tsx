import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import {
  FullscreenWorkspace,
  WorkspaceCanvas,
  WorkspacePanel,
} from '@/components/layout/FullscreenWorkspace';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Input } from '@/components/forms/Input';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

const INITIAL_LAYERS: ReadonlyArray<Layer> = [
  { id: 'bg', name: 'Background', visible: true, locked: true },
  { id: 'hero-text', name: 'Hero text', visible: true, locked: false },
  { id: 'cta', name: 'CTA button', visible: true, locked: false },
  { id: 'product-shot', name: 'Product shot', visible: false, locked: false },
];

function LayersPanelBody({
  layers,
  onToggle,
  onSelect,
  selectedId,
}: {
  layers: ReadonlyArray<Layer>;
  onToggle: (id: string, key: 'visible' | 'locked') => void;
  onSelect: (id: string) => void;
  selectedId: string;
}) {
  return (
    <ul className="space-y-1">
      {layers.map((layer) => {
        const isSelected = layer.id === selectedId;
        return (
          <li key={layer.id}>
            <button
              type="button"
              onClick={() => onSelect(layer.id)}
              aria-current={isSelected ? 'true' : undefined}
              className={
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' +
                (isSelected ? ' bg-surface-muted text-foreground' : ' text-foreground-muted')
              }
            >
              <span
                role="switch"
                aria-checked={layer.visible}
                aria-label={`${layer.name} visibility`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(layer.id, 'visible');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle(layer.id, 'visible');
                  }
                }}
                tabIndex={0}
                className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-foreground-muted hover:text-foreground"
              >
                {layer.visible ? (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </span>
              <span
                role="switch"
                aria-checked={layer.locked}
                aria-label={`${layer.name} lock`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(layer.id, 'locked');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle(layer.id, 'locked');
                  }
                }}
                tabIndex={0}
                className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-foreground-muted hover:text-foreground"
              >
                <Lock
                  className={'h-3.5 w-3.5 ' + (layer.locked ? 'text-foreground' : 'opacity-30')}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1 truncate">{layer.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function PropertiesPanelBody({ layer }: { layer: Layer }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-foreground-subtle">Selected</p>
        <p className="text-sm font-semibold text-foreground">{layer.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[11px] text-foreground-muted" htmlFor="prop-x">
            x
          </label>
          <Input id="prop-x" inputSize="sm" defaultValue={120} type="number" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-foreground-muted" htmlFor="prop-y">
            y
          </label>
          <Input id="prop-y" inputSize="sm" defaultValue={40} type="number" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-foreground-muted" htmlFor="prop-w">
            width
          </label>
          <Input id="prop-w" inputSize="sm" defaultValue={320} type="number" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-foreground-muted" htmlFor="prop-h">
            height
          </label>
          <Input id="prop-h" inputSize="sm" defaultValue={64} type="number" />
        </div>
      </div>
    </div>
  );
}

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
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">FullscreenWorkspace</h1>
          <p className="mt-1 text-foreground-muted">
            A true full-viewport canvas with floating, draggable, collapsible panels. Use for visual
            editors, dashboard-edit modes, and design tools.
          </p>
        </header>
        <section className="space-y-3 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-base font-semibold">Try it</h2>
          <p className="text-sm text-foreground-muted">
            Open the workspace and drag the Layers / Properties panels around. Position is clamped
            to the canvas — drag a panel to a corner and the cursor will trail off but the panel
            sticks.
          </p>
          <Button onClick={() => setOpen(true)}>Open workspace</Button>
        </section>
      </div>
    );
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
