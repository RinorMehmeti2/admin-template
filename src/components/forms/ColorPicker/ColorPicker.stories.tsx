import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { FormField } from '@/components/forms/FormField';

export default { title: 'Forms/ColorPicker', component: ColorPicker };

function HexOnlyDemo() {
  const [v, setV] = useState('#3b82f6');
  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Color" description="Hex output.">
        <ColorPicker value={v} onValueChange={setV} format="hex" />
      </FormField>
      <p className="text-xs font-mono text-foreground-muted">value: {v}</p>
    </div>
  );
}
export const HexOnly = { render: () => <HexOnlyDemo /> };

function FormatToggleDemo() {
  const [v, setV] = useState('rgb(59, 130, 246)');
  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Color" description="Toggle output format inside the popover.">
        <ColorPicker value={v} onValueChange={setV} format="rgb" />
      </FormField>
      <p className="text-xs font-mono text-foreground-muted">value: {v}</p>
    </div>
  );
}
export const WithRgbDefault = { render: () => <FormatToggleDemo /> };

function WithAlphaDemo() {
  const [v, setV] = useState('rgba(239, 68, 68, 0.5)');
  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Overlay color" description="Alpha slider enabled.">
        <ColorPicker value={v} onValueChange={setV} withAlpha format="rgb" />
      </FormField>
      <p className="text-xs font-mono text-foreground-muted">value: {v}</p>
      <div
        aria-hidden="true"
        className="h-16 rounded-md border border-border"
        style={{ backgroundColor: v }}
      />
    </div>
  );
}
export const WithAlpha = { render: () => <WithAlphaDemo /> };

const BRAND_PRESETS: ReadonlyArray<string> = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#0f172a',
  '#475569',
  '#94a3b8',
  '#e2e8f0',
];

function PresetsDemo() {
  const [v, setV] = useState('#3b82f6');
  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Brand color" description="Click a preset or fine-tune in the canvas.">
        <ColorPicker value={v} onValueChange={setV} presets={BRAND_PRESETS} />
      </FormField>
    </div>
  );
}
export const WithPresets = { render: () => <PresetsDemo /> };

function DisabledDemo() {
  return (
    <div className="max-w-sm">
      <FormField label="Locked color">
        <ColorPicker defaultValue="#3b82f6" disabled />
      </FormField>
    </div>
  );
}
export const Disabled = { render: () => <DisabledDemo /> };
