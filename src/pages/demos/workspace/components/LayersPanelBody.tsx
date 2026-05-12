import { Eye, EyeOff, Lock } from 'lucide-react';
import type { Layer } from '../model';

export function LayersPanelBody({
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
