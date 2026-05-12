import { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { Input } from '@/components/forms/Input';
import { NumberInput } from '@/components/forms/NumberInput';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { Combobox, ComboboxContent, ComboboxTrigger } from '@/components/forms/Combobox';
import { cn } from '@/lib/cn';
import type { StyleOverlayValues } from './types';

/*
 * StyleOverlay — universal "advanced styling" panel rendered alongside the
 * per-component prop controls. Emits a partial StyleOverlayValues object;
 * the playground merges that into the live preview as `style` + `className`
 * and into the generated JSX.
 *
 * Sections collapse independently. Empty fields are dropped (component
 * defaults win).
 */

interface StyleOverlayProps {
  values: StyleOverlayValues;
  onChange: (next: StyleOverlayValues) => void;
}

const SHADOW_OPTIONS = ['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
const BORDER_STYLE_OPTIONS = ['solid', 'dashed', 'dotted', 'double', 'none'] as const;
const FONT_WEIGHT_OPTIONS = ['300', '400', '500', '600', '700', '800'] as const;

export function StyleOverlay({ values, onChange }: StyleOverlayProps) {
  const set = <K extends keyof StyleOverlayValues>(key: K, next: StyleOverlayValues[K]) => {
    if (next === undefined || next === '' || (typeof next === 'number' && Number.isNaN(next))) {
      const copy = { ...values };
      Reflect.deleteProperty(copy, key);
      onChange(copy);
      return;
    }
    onChange({ ...values, [key]: next });
  };

  const reset = () => onChange({});
  const isEmpty = Object.keys(values).length === 0;

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Style overrides</h3>
        <button
          type="button"
          onClick={reset}
          disabled={isEmpty}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Clear
        </button>
      </div>
      <p className="text-[0.6875rem] text-foreground-subtle">
        Inline <code className="font-mono">style</code> + extra className applied to the component
        root. Empty fields use component defaults.
      </p>

      <Section title="Spacing" defaultOpen>
        <BoxQuad
          label="Padding"
          unit="px"
          values={[
            values.paddingTop,
            values.paddingRight,
            values.paddingBottom,
            values.paddingLeft,
          ]}
          onChange={(t, r, b, l) => {
            const next = { ...values };
            assignOrDelete(next, 'paddingTop', t);
            assignOrDelete(next, 'paddingRight', r);
            assignOrDelete(next, 'paddingBottom', b);
            assignOrDelete(next, 'paddingLeft', l);
            onChange(next);
          }}
        />
        <BoxQuad
          label="Margin"
          unit="px"
          values={[values.marginTop, values.marginRight, values.marginBottom, values.marginLeft]}
          onChange={(t, r, b, l) => {
            const next = { ...values };
            assignOrDelete(next, 'marginTop', t);
            assignOrDelete(next, 'marginRight', r);
            assignOrDelete(next, 'marginBottom', b);
            assignOrDelete(next, 'marginLeft', l);
            onChange(next);
          }}
        />
      </Section>

      <Section title="Border">
        <Row label="Width">
          <NumberInput
            value={values.borderWidth ?? 0}
            min={0}
            max={20}
            step={1}
            onValueChange={(v) => set('borderWidth', v === 0 || v === null ? undefined : v)}
          />
        </Row>
        <Row label="Style">
          <Combobox<string>
            items={BORDER_STYLE_OPTIONS as unknown as string[]}
            getItemLabel={(s) => s}
            getItemValue={(s) => s}
            value={values.borderStyle ?? ''}
            onValueChange={(v) =>
              set(
                'borderStyle',
                typeof v === 'string' && v !== ''
                  ? (v as StyleOverlayValues['borderStyle'])
                  : undefined,
              )
            }
          >
            <ComboboxTrigger placeholder="solid" />
            <ComboboxContent />
          </Combobox>
        </Row>
        <Row label="Color">
          <ColorPicker
            value={values.borderColor ?? '#000000'}
            onValueChange={(v) => set('borderColor', v)}
          />
        </Row>
        <Row label="Radius">
          <NumberInput
            value={values.borderRadius ?? 0}
            min={0}
            max={48}
            step={1}
            onValueChange={(v) => set('borderRadius', v === 0 || v === null ? undefined : v)}
          />
        </Row>
      </Section>

      <Section title="Colors">
        <Row label="Background">
          <ColorPicker
            value={values.backgroundColor ?? '#ffffff'}
            onValueChange={(v) => set('backgroundColor', v)}
          />
        </Row>
        <Row label="Text">
          <ColorPicker value={values.color ?? '#000000'} onValueChange={(v) => set('color', v)} />
        </Row>
        <Row label="Opacity">
          <NumberInput
            value={values.opacity ?? 1}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(v) => set('opacity', v === 1 || v === null ? undefined : v)}
          />
        </Row>
      </Section>

      <Section title="Size">
        <Row label="Width">
          <Input
            value={values.width ?? ''}
            placeholder="auto, 200px, 50%"
            onChange={(e) => set('width', e.target.value === '' ? undefined : e.target.value)}
          />
        </Row>
        <Row label="Height">
          <Input
            value={values.height ?? ''}
            placeholder="auto, 40px"
            onChange={(e) => set('height', e.target.value === '' ? undefined : e.target.value)}
          />
        </Row>
        <Row label="Min width">
          <Input
            value={values.minWidth ?? ''}
            placeholder="0, 120px"
            onChange={(e) => set('minWidth', e.target.value === '' ? undefined : e.target.value)}
          />
        </Row>
        <Row label="Max width">
          <Input
            value={values.maxWidth ?? ''}
            placeholder="none, 480px"
            onChange={(e) => set('maxWidth', e.target.value === '' ? undefined : e.target.value)}
          />
        </Row>
      </Section>

      <Section title="Typography">
        <Row label="Font size">
          <NumberInput
            value={values.fontSize ?? 14}
            min={8}
            max={72}
            step={1}
            onValueChange={(v) => set('fontSize', v === 14 || v === null ? undefined : v)}
          />
        </Row>
        <Row label="Weight">
          <Combobox<string>
            items={FONT_WEIGHT_OPTIONS as unknown as string[]}
            getItemLabel={(s) => s}
            getItemValue={(s) => s}
            value={values.fontWeight ?? ''}
            onValueChange={(v) =>
              set(
                'fontWeight',
                typeof v === 'string' && v !== ''
                  ? (v as StyleOverlayValues['fontWeight'])
                  : undefined,
              )
            }
          >
            <ComboboxTrigger placeholder="400" />
            <ComboboxContent />
          </Combobox>
        </Row>
        <Row label="Letter spacing">
          <NumberInput
            value={values.letterSpacing ?? 0}
            min={-2}
            max={10}
            step={0.5}
            onValueChange={(v) => set('letterSpacing', v === 0 || v === null ? undefined : v)}
          />
        </Row>
      </Section>

      <Section title="Effects">
        <Row label="Shadow">
          <Combobox<string>
            items={SHADOW_OPTIONS as unknown as string[]}
            getItemLabel={(s) => s}
            getItemValue={(s) => s}
            value={values.boxShadow ?? ''}
            onValueChange={(v) =>
              set(
                'boxShadow',
                typeof v === 'string' && v !== ''
                  ? (v as StyleOverlayValues['boxShadow'])
                  : undefined,
              )
            }
          >
            <ComboboxTrigger placeholder="none" />
            <ComboboxContent />
          </Combobox>
        </Row>
      </Section>

      <Section title="Custom className">
        <Input
          value={values.className ?? ''}
          placeholder="hover:bg-primary/10 ring-2 …"
          className="font-mono text-xs"
          onChange={(e) => set('className', e.target.value === '' ? undefined : e.target.value)}
        />
        <p className="text-[0.6875rem] text-foreground-subtle">
          Tailwind utility classes merged via <code className="font-mono">cn()</code>.
        </p>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-border bg-surface-muted/30">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        )}
      </button>
      {open ? <div className="space-y-2 px-2 pb-2 pt-1">{children}</div> : null}
    </div>
  );
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

function Row({ label, children }: RowProps) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
      <label className="text-[0.6875rem] font-medium text-foreground-muted">{label}</label>
      <div>{children}</div>
    </div>
  );
}

interface BoxQuadProps {
  label: string;
  unit: string;
  values: [number | undefined, number | undefined, number | undefined, number | undefined];
  onChange: (
    top: number | undefined,
    right: number | undefined,
    bottom: number | undefined,
    left: number | undefined,
  ) => void;
}

function BoxQuad({ label, unit, values, onChange }: BoxQuadProps) {
  const [t, r, b, l] = values;
  const cls = 'h-7 rounded border border-border bg-surface px-1.5 text-xs';
  const parse = (v: string): number | undefined => {
    if (v === '') return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-medium text-foreground-muted">{label}</span>
        <span className="text-[0.625rem] text-foreground-subtle">{unit}</span>
      </div>
      <div className={cn('grid grid-cols-4 gap-1')}>
        {(
          [
            ['T', t],
            ['R', r],
            ['B', b],
            ['L', l],
          ] as const
        ).map(([sideLabel, val], idx) => (
          <label key={sideLabel} className="flex flex-col items-center gap-0.5">
            <input
              type="number"
              value={val ?? ''}
              placeholder="0"
              className={cn(cls, 'w-full text-center')}
              onChange={(e) => {
                const next = parse(e.target.value);
                const arr: [
                  number | undefined,
                  number | undefined,
                  number | undefined,
                  number | undefined,
                ] = [t, r, b, l];
                arr[idx] = next;
                onChange(arr[0], arr[1], arr[2], arr[3]);
              }}
            />
            <span className="text-[0.625rem] text-foreground-subtle">{sideLabel}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function assignOrDelete<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K] | undefined,
): void {
  if (value === undefined) {
    Reflect.deleteProperty(obj, key as PropertyKey);
  } else {
    obj[key] = value;
  }
}
