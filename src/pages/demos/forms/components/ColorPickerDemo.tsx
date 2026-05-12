import { useState } from 'react';
import { ColorPicker, FormField } from '@/components/forms';
import { BRAND_PRESETS } from '../data';

export function ColorPickerDemo() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('rgb(34, 197, 94)');
  const [alpha, setAlpha] = useState('rgba(239, 68, 68, 0.5)');
  const [brand, setBrand] = useState('#22c55e');

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Hex" description="Default format.">
        <ColorPicker value={hex} onValueChange={setHex} />
        <p className="mt-1 font-mono text-xs text-foreground-muted">{hex}</p>
      </FormField>

      <FormField label="RGB with toggle" description="Toggle format inside the popover.">
        <ColorPicker value={rgb} onValueChange={setRgb} format="rgb" />
        <p className="mt-1 font-mono text-xs text-foreground-muted">{rgb}</p>
      </FormField>

      <FormField label="With alpha" description="Alpha slider + transparency-aware output.">
        <ColorPicker value={alpha} onValueChange={setAlpha} withAlpha format="rgb" />
        <div
          aria-hidden="true"
          className="mt-2 h-12 rounded-md border border-border"
          style={{ backgroundColor: alpha }}
        />
      </FormField>

      <FormField label="Brand color" description="With preset palette.">
        <ColorPicker value={brand} onValueChange={setBrand} presets={BRAND_PRESETS} />
      </FormField>
    </div>
  );
}
