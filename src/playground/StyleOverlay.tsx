import { useCallback, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Link as LinkIcon, RotateCcw } from 'lucide-react';
import { Input } from '@/components/forms/Input';
import { NumberInput } from '@/components/forms/NumberInput';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { Combobox, ComboboxContent, ComboboxTrigger } from '@/components/forms/Combobox';
import { cn } from '@/lib/cn';
import {
  ALL_STYLE_SECTIONS,
  STYLE_SECTION_KEYS,
  resolveSections,
} from './profile';
import type { StyleOverlayProfile, StyleOverlaySection, StyleOverlayValues } from './types';

/*
 * StyleOverlay — universal "advanced styling" panel rendered alongside the
 * per-component prop controls. Emits a partial StyleOverlayValues object;
 * the playground merges that into the live preview as `style` + `className`
 * and into the generated JSX.
 *
 * Section visibility is driven by the entry's `styleProfile` (defaulting to
 * "every section"). Disabled sections are hidden from the UI but their
 * existing values are kept in state — switching profiles is non-destructive.
 * The Clear button clears values that belong to currently-shown sections only
 * for the same reason.
 *
 * Spacing inputs default to axis-linked (X writes left+right, Y writes
 * top+bottom). A per-instance toggle flips to a four-input "T R B L" layout.
 * Collapse rule (per-side → axis): we keep `Math.max(top, bottom)` and the
 * larger of left/right so no information is silently dropped.
 */

interface StyleOverlayProps {
  values: StyleOverlayValues;
  onChange: (next: StyleOverlayValues) => void;
  profile?: StyleOverlayProfile;
}

const SHADOW_OPTIONS = ['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
const BORDER_STYLE_OPTIONS = ['solid', 'dashed', 'dotted', 'double', 'none'] as const;
const FONT_WEIGHT_OPTIONS = ['300', '400', '500', '600', '700', '800'] as const;

export function StyleOverlay({ values, onChange, profile }: StyleOverlayProps) {
  const sections = resolveSections(profile);
  const has = useCallback((s: StyleOverlaySection) => sections.has(s), [sections]);

  const set = <K extends keyof StyleOverlayValues>(key: K, next: StyleOverlayValues[K]) => {
    if (next === undefined || next === '' || (typeof next === 'number' && Number.isNaN(next))) {
      const copy = { ...values };
      Reflect.deleteProperty(copy, key);
      onChange(copy);
      return;
    }
    onChange({ ...values, [key]: next });
  };

  const reset = () => {
    const allowed = new Set<keyof StyleOverlayValues>();
    for (const sec of ALL_STYLE_SECTIONS) {
      if (!sections.has(sec)) continue;
      for (const k of STYLE_SECTION_KEYS[sec]) allowed.add(k);
    }
    const next: StyleOverlayValues = {};
    for (const [k, v] of Object.entries(values) as Array<[keyof StyleOverlayValues, unknown]>) {
      if (allowed.has(k)) continue;
      if (v === undefined) continue;
      Object.assign(next, { [k]: v });
    }
    onChange(next);
  };

  const visibleKeys = new Set<keyof StyleOverlayValues>();
  for (const sec of sections) for (const k of STYLE_SECTION_KEYS[sec]) visibleKeys.add(k);
  const isEmpty = (Object.keys(values) as Array<keyof StyleOverlayValues>).every(
    (k) => !visibleKeys.has(k) || values[k] === undefined,
  );

  if (sections.size === 0) return null;

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

      {has('spacing') ? (
        <Section title="Spacing" defaultOpen>
          <BoxAxis
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
          <BoxAxis
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
      ) : null}

      {has('border') ? (
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
      ) : null}

      {has('colors') ? (
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
      ) : null}

      {has('size') ? (
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
      ) : null}

      {has('typography') ? (
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
      ) : null}

      {has('effects') ? (
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
      ) : null}

      {has('className') ? (
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
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
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
  children: ReactNode;
}

function Row({ label, children }: RowProps) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
      <label className="text-[0.6875rem] font-medium text-foreground-muted">{label}</label>
      <div>{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export type BoxAxisMode = 'axis' | 'side';

interface BoxAxisProps {
  label: string;
  unit: string;
  values: [number | undefined, number | undefined, number | undefined, number | undefined];
  onChange: (
    top: number | undefined,
    right: number | undefined,
    bottom: number | undefined,
    left: number | undefined,
  ) => void;
  /** Test-only initial mode override. Defaults to 'axis'. */
  initialMode?: BoxAxisMode;
}

function pickAxis(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined && b === undefined) return undefined;
  if (a === undefined) return b;
  if (b === undefined) return a;
  return a >= b ? a : b;
}

function parseNumber(v: string): number | undefined {
  if (v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export function BoxAxis({ label, unit, values, onChange, initialMode = 'axis' }: BoxAxisProps) {
  const [mode, setMode] = useState<BoxAxisMode>(initialMode);
  const [t, r, b, l] = values;

  const toAxis = () => {
    const y = pickAxis(t, b);
    const x = pickAxis(l, r);
    onChange(y, x, y, x);
    setMode('axis');
  };

  const toSide = () => setMode('side');

  const inputCls = 'h-7 w-full rounded border border-border bg-surface px-1.5 text-center text-xs';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] font-medium text-foreground-muted">{label}</span>
        <div className="flex items-center gap-1">
          <span className="text-[0.625rem] text-foreground-subtle">{unit}</span>
          <div
            role="group"
            aria-label={`${label} input mode`}
            className="flex items-center overflow-hidden rounded-md border border-border"
          >
            <button
              type="button"
              aria-pressed={mode === 'axis'}
              aria-label="Axis link"
              onClick={toAxis}
              className={cn(
                'px-1.5 py-0.5 text-[0.625rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                mode === 'axis'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-muted hover:bg-surface-muted hover:text-foreground',
              )}
              title="Link X = left + right, Y = top + bottom"
            >
              <LinkIcon className="h-3 w-3" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={mode === 'side'}
              aria-label="Per-side"
              onClick={toSide}
              className={cn(
                'px-1.5 py-0.5 text-[0.625rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                mode === 'side'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-foreground-muted hover:bg-surface-muted hover:text-foreground',
              )}
              title="Per-side (top / right / bottom / left)"
            >
              <span aria-hidden="true">T·R·B·L</span>
            </button>
          </div>
        </div>
      </div>

      {mode === 'axis' ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-1">
            <span className="text-[0.625rem] text-foreground-subtle">X</span>
            <input
              type="number"
              value={pickAxis(l, r) ?? ''}
              placeholder="0"
              className={inputCls}
              aria-label={`${label} horizontal`}
              onChange={(e) => {
                const v = parseNumber(e.target.value);
                onChange(t, v, b, v);
              }}
            />
          </label>
          <label className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-1">
            <span className="text-[0.625rem] text-foreground-subtle">Y</span>
            <input
              type="number"
              value={pickAxis(t, b) ?? ''}
              placeholder="0"
              className={inputCls}
              aria-label={`${label} vertical`}
              onChange={(e) => {
                const v = parseNumber(e.target.value);
                onChange(v, r, v, l);
              }}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {(
            [
              ['T', t, 0],
              ['R', r, 1],
              ['B', b, 2],
              ['L', l, 3],
            ] as const
          ).map(([sideLabel, val, idx]) => (
            <label key={sideLabel} className="flex flex-col items-center gap-0.5">
              <input
                type="number"
                value={val ?? ''}
                placeholder="0"
                className={inputCls}
                aria-label={`${label} ${sideLabel}`}
                onChange={(e) => {
                  const next = parseNumber(e.target.value);
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
      )}
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
