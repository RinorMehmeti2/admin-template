import { useState } from 'react';
import { RotateCcw, Save, TrendingUp } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/data-display/Card';
import { Input } from '@/components/forms/Input';
import { Label } from '@/components/forms/Label';
import { Select } from '@/components/forms/Select';
import { Slider } from '@/components/forms/Slider';
import { Switch } from '@/components/forms/Switch';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_THEME, type SimsThemeConfig } from '../data';

const PRESETS = [
  { name: 'Forest', primary: '#2D6A4F', secondary: '#74C69D' },
  { name: 'Indigo', primary: '#3730A3', secondary: '#818CF8' },
  { name: 'Slate', primary: '#334155', secondary: '#94A3B8' },
  { name: 'Amber', primary: '#B45309', secondary: '#FBBF24' },
  { name: 'Rose', primary: '#9F1239', secondary: '#FB7185' },
];

const FONTS = ['Inter', 'IBM Plex Sans', 'Source Sans Pro', 'Nunito', 'Manrope'];

export function ThemeConfigPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<SimsThemeConfig>(MOCK_THEME);

  const update = <K extends keyof SimsThemeConfig>(k: K, v: SimsThemeConfig[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <SimsPageHeader
        title="Theme Configuration"
        description="Customize colors, typography, and density. Changes preview live below."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={() => {
                setForm(MOCK_THEME);
                toast.info('Theme reset');
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => toast.success('Theme saved')}
            >
              Save
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-foreground-muted">Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const active = form.primary === p.primary;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, primary: p.primary, secondary: p.secondary }))
                      }
                      className={cn(
                        'flex items-center gap-2 rounded-md border-2 px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-surface hover:bg-surface-muted',
                      )}
                    >
                      <div className="flex">
                        <span
                          className="h-4.5 inline-block h-4 w-4 rounded-full border-2 border-surface"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span
                          className="-ml-1.5 inline-block h-4 w-4 rounded-full border-2 border-surface"
                          style={{ backgroundColor: p.secondary }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <ColorRow label="Primary" value={form.primary} onChange={(v) => update('primary', v)} />
            <ColorRow
              label="Secondary"
              value={form.secondary}
              onChange={(v) => update('secondary', v)}
            />
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Typography & shape</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="sims-fhead">Headings font</Label>
              <Select
                id="sims-fhead"
                value={form.fontHead}
                onChange={(e) => update('fontHead', e.target.value)}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sims-fbody">Body font</Label>
              <Select
                id="sims-fbody"
                value={form.fontBody}
                onChange={(e) => update('fontBody', e.target.value)}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label>Corner radius</Label>
                <span className="font-mono text-xs">{form.radius}px</span>
              </div>
              <Slider
                value={form.radius}
                onValueChange={(v) => update('radius', v)}
                min={0}
                max={20}
                step={1}
                aria-label="Corner radius"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-semibold">Compact density</p>
                <p className="text-xs text-foreground-muted">
                  Tighter row spacing for data-heavy screens.
                </p>
              </div>
              <Switch checked={form.dense} onChange={(e) => update('dense', e.target.checked)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="outlined" className="mt-4">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>A small sample of the configured theme</CardDescription>
        </CardHeader>
        <CardContent className="bg-surface-muted">
          <div className="flex flex-wrap gap-3">
            <div
              className="min-w-80 flex-1 border border-border bg-surface p-5"
              style={{ borderRadius: `${form.radius}px` }}
            >
              <p className="mb-1 text-xl font-bold" style={{ fontFamily: form.fontHead }}>
                Welcome back, Arta
              </p>
              <p
                className="mb-3 text-sm text-foreground-muted"
                style={{ fontFamily: form.fontBody }}
              >
                Here's a sample card using your theme.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: form.primary, borderRadius: `${form.radius}px` }}
                >
                  Primary action
                </button>
                <button
                  type="button"
                  className="border-2 bg-transparent px-3 py-1.5 text-sm font-semibold"
                  style={{
                    borderColor: form.primary,
                    color: form.primary,
                    borderRadius: `${form.radius}px`,
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>
            <div
              className="min-w-72 flex-1 border border-border bg-surface p-5"
              style={{ borderRadius: `${form.radius}px` }}
            >
              <p className="text-xs uppercase tracking-wide text-foreground-muted">Total users</p>
              <p
                className="mt-1 text-4xl font-bold leading-none"
                style={{ fontFamily: form.fontHead }}
              >
                2,287
              </p>
              <div
                className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5"
                style={{
                  borderRadius: '999px',
                  backgroundColor: form.secondary,
                  color: '#0D1F17',
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">+4.2%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        <ColorPicker value={value} onValueChange={onChange} format="hex" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="font-mono text-xs text-foreground-muted">{value.toUpperCase()}</p>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputSize="sm"
        className="w-32 font-mono text-xs"
      />
    </div>
  );
}
