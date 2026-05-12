import { Input } from '@/components/forms/Input';
import type { Layer } from '../model';

export function PropertiesPanelBody({ layer }: { layer: Layer }) {
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
