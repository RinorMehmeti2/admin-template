import { RotateCcw } from 'lucide-react';
import { useId } from 'react';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { NumberInput } from '@/components/forms/NumberInput';
import { Switch } from '@/components/forms/Switch';
import { Combobox, ComboboxContent, ComboboxTrigger } from '@/components/forms/Combobox';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { IconButton } from '@/components/primitives/IconButton';
import { StyleOverlay } from './StyleOverlay';
import {
  STYLE_OVERLAY_KEY,
  type PlaygroundEntry,
  type PropSchema,
  type PropValues,
  type StyleOverlayValues,
} from './types';

interface PropControlsProps {
  entry: PlaygroundEntry;
  values: PropValues;
  onChange: (next: PropValues) => void;
  onReset: () => void;
}

export function PropControls({ entry, values, onChange, onReset }: PropControlsProps) {
  const setKey = (key: string, next: unknown) => {
    if (next === undefined) {
      const copy: PropValues = {};
      for (const [k, v] of Object.entries(values)) {
        if (k !== key) copy[k] = v;
      }
      onChange(copy);
      return;
    }
    onChange({ ...values, [key]: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Props</h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset all
        </button>
      </div>
      <div className="space-y-3">
        {Object.entries(entry.propSchemas).map(([name, schema]) => (
          <PropControl
            key={name}
            name={name}
            schema={schema}
            value={values[name]}
            onChange={(next) => setKey(name, next)}
          />
        ))}
      </div>
      {entry.advancedStyle !== false ? (
        <StyleOverlay
          values={(values[STYLE_OVERLAY_KEY] as StyleOverlayValues | undefined) ?? {}}
          onChange={(next) => setKey(STYLE_OVERLAY_KEY, next)}
        />
      ) : null}
    </div>
  );
}

interface PropControlProps {
  name: string;
  schema: PropSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}

function PropControl({ name, schema, value, onChange }: PropControlProps) {
  const reactId = useId();
  const inputId = `${reactId}-${name}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-xs font-medium text-foreground-muted">
          <span className="font-mono">{name}</span>
          <span className="ml-1.5 rounded bg-surface-muted px-1 py-0.5 text-[0.625rem] text-foreground-subtle">
            {schema.kind}
          </span>
        </label>
        {value !== undefined && schema.default !== undefined ? (
          <IconButton
            aria-label={`Reset ${name}`}
            variant="ghost"
            size="sm"
            className="h-6 w-6"
            onClick={() => onChange(schema.default)}
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </IconButton>
        ) : null}
      </div>

      <ControlInput
        name={name}
        inputId={inputId}
        schema={schema}
        value={value}
        onChange={onChange}
      />

      {schema.description !== undefined ? (
        <p className="text-[0.6875rem] text-foreground-subtle">{schema.description}</p>
      ) : null}
    </div>
  );
}

interface ControlInputProps {
  name: string;
  inputId: string;
  schema: PropSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}

function ControlInput({ name, inputId, schema, value, onChange }: ControlInputProps) {
  switch (schema.kind) {
    case 'string': {
      const v = typeof value === 'string' ? value : '';
      if (schema.multiline === true) {
        return (
          <Textarea
            id={inputId}
            value={v}
            placeholder={schema.placeholder}
            onChange={(e) => onChange(e.target.value)}
            minRows={2}
            maxRows={6}
          />
        );
      }
      return (
        <Input
          id={inputId}
          type="text"
          value={v}
          placeholder={schema.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    case 'number': {
      const v = typeof value === 'number' ? value : 0;
      return (
        <NumberInput
          id={inputId}
          value={v}
          {...(schema.min !== undefined ? { min: schema.min } : {})}
          {...(schema.max !== undefined ? { max: schema.max } : {})}
          {...(schema.step !== undefined ? { step: schema.step } : {})}
          onValueChange={(next) => onChange(next)}
        />
      );
    }
    case 'boolean': {
      const v = value === true;
      return (
        <div className="flex items-center gap-2">
          <Switch id={inputId} checked={v} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-xs text-foreground-muted">{v ? 'true' : 'false'}</span>
        </div>
      );
    }
    case 'color': {
      const v = typeof value === 'string' ? value : '#000000';
      return <ColorPicker value={v} onValueChange={onChange} />;
    }
    case 'enum': {
      const v = typeof value === 'string' ? value : '';
      const options = schema.options;
      return (
        <Combobox<string>
          items={options}
          getItemLabel={(s) => s}
          getItemValue={(s) => s}
          value={v}
          onValueChange={(next) => onChange(typeof next === 'string' ? next : v)}
        >
          <ComboboxTrigger placeholder="Select…" />
          <ComboboxContent />
        </Combobox>
      );
    }
    case 'jsx': {
      const v = typeof value === 'string' ? value : '';
      const presets = schema.presets;
      return (
        <div className="space-y-2">
          {presets !== undefined && presets.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {presets.map((preset) => {
                const active = preset.value === v;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChange(preset.value)}
                    aria-pressed={active}
                    className={
                      active
                        ? 'rounded-md border border-primary bg-primary/10 px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                        : 'rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    }
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          ) : null}
          <Textarea
            id={inputId}
            value={v}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`<${name} />`}
            minRows={2}
            maxRows={4}
            className="font-mono text-xs"
          />
          <p className="text-[0.6875rem] text-foreground-subtle">
            Literal JSX — copied verbatim into &ldquo;Copy code&rdquo;. Live preview uses the
            selected preset (or nothing if free-text).
          </p>
        </div>
      );
    }
  }
}
