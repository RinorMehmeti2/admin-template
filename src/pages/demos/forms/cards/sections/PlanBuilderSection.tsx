import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, MapPin, Pencil } from 'lucide-react';
import { Controller, Form, useForm, useWatch } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Checkbox } from '@/components/forms/Checkbox';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { Stat } from '@/components/data-display/Stat';
import { RovingFocusGroup, useRovingFocusItem } from '@/hooks/useRovingFocus';
import { cn } from '@/lib/cn';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';
import { ADDONS, COUNTRY_OPTIONS, PLANS } from '../../_shared/data';
import { formatMoney } from '../../_shared/format';

interface PlanValues {
  plan: 'starter' | 'pro' | 'enterprise';
  addons: ReadonlyArray<string>;
  billingAddress: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
}

interface PlanCardProps {
  index: number;
  plan: (typeof PLANS)[number];
  selected: boolean;
  onSelect: (id: PlanValues['plan']) => void;
}

function PlanCard({ index, plan, selected, onSelect }: PlanCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusItem(index, ref);
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect(plan.id);
          return;
        }
        onKeyDown(e);
      }}
      onFocus={onFocus}
      onClick={() => onSelect(plan.id)}
      className={cn(
        'relative flex h-full flex-col gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'border-primary ring-2 ring-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-surface-muted/40',
      )}
    >
      {selected ? (
        <span
          className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-tight">{plan.label}</p>
        <p className="text-xs text-foreground-muted">{plan.description}</p>
      </div>
      <p className="text-2xl font-semibold">
        {plan.price === 0 ? (
          'Free'
        ) : (
          <>
            ${plan.price}
            <span className="text-sm font-normal text-foreground-muted"> /mo</span>
          </>
        )}
      </p>
      <ul className="space-y-1 text-xs text-foreground-muted">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

interface AddressCardProps {
  values: PlanValues['billingAddress'];
  onSave: (next: PlanValues['billingAddress']) => void;
}

function AddressCard({ values, onSave }: AddressCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(values);

  if (!editing) {
    const country = COUNTRY_OPTIONS.find((c) => c.code === values.country)?.label ?? values.country;
    return (
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              Billing address
            </CardTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => {
              setDraft(values);
              setEditing(true);
            }}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2 text-sm text-foreground">
          {values.street.trim() === '' ? (
            <p className="text-foreground-muted">No address on file.</p>
          ) : (
            <address className="not-italic leading-relaxed">
              {values.street}
              <br />
              {values.city}, {values.zip}
              <br />
              {country}
            </address>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MapPin className="h-4 w-4" />
          </span>
          Edit billing address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6 pt-2">
        <FormField label="Street">
          <Input
            value={draft.street}
            onChange={(e) => setDraft({ ...draft, street: e.target.value })}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="City">
            <Input
              value={draft.city}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
            />
          </FormField>
          <FormField label="ZIP">
            <Input
              value={draft.zip}
              onChange={(e) => setDraft({ ...draft, zip: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Country">
          <Select
            value={draft.country}
            onChange={(e) => setDraft({ ...draft, country: e.target.value })}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraft(values);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              onSave(draft);
              setEditing(false);
            }}
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryStatsProps {
  control: ReturnType<typeof useForm<PlanValues>>['control'];
}

function SummaryStats({ control }: SummaryStatsProps): ReactNode {
  const plan = useWatch({ control, name: 'plan' });
  const addons = useWatch({ control, name: 'addons' });
  const selectedPlan = PLANS.find((p) => p.id === plan);
  const addonTotal = useMemo(
    () => ADDONS.filter((a) => addons.includes(a.id)).reduce((sum, a) => sum + a.price, 0),
    [addons],
  );
  const monthly = (selectedPlan?.price ?? 0) + addonTotal;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card variant="outlined" className="p-4">
        <Stat label="Plan" value={selectedPlan?.label ?? '—'} />
      </Card>
      <Card variant="outlined" className="p-4">
        <Stat label="Add-ons" value={String(addons.length)} />
      </Card>
      <Card variant="outlined" className="p-4">
        <Stat
          label="Monthly total"
          value={formatMoney(monthly, 'USD')}
          deltaLabel={addonTotal > 0 ? `+${formatMoney(addonTotal, 'USD')} add-ons` : 'No add-ons'}
        />
      </Card>
    </div>
  );
}

export function PlanBuilderSection() {
  const { t } = useTranslation();
  const form = useForm<PlanValues>({
    defaultValues: {
      plan: 'pro',
      addons: ['analytics'],
      billingAddress: {
        street: '1 Market St',
        city: 'San Francisco',
        zip: '94105',
        country: 'US',
      },
    },
  });

  return (
    <Section
      id="plan-builder"
      title={t('forms.cards.selectable.title')}
      description={t('forms.cards.selectable.description')}
      code={`<Form form={form} onSubmit={() => undefined} className="space-y-6">
  <SummaryStats control={form.control} />

  <div className="space-y-2">
    <h3 className="text-sm font-semibold tracking-tight">Pick a plan</h3>
    <Controller
      control={form.control}
      name="plan"
      render={({ field }) => {
        const idx = PLANS.findIndex((p) => p.id === field.value);
        return (
          <RovingFocusGroup orientation="horizontal" defaultIndex={Math.max(0, idx)}>
            <div
              role="radiogroup"
              aria-label="Pick a plan"
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {PLANS.map((p, i) => (
                <PlanCard
                  key={p.id}
                  index={i}
                  plan={p}
                  selected={field.value === p.id}
                  onSelect={(id) => field.onChange(id)}
                />
              ))}
            </div>
          </RovingFocusGroup>
        );
      }}
    />
  </div>

  <div className="space-y-2">
    <h3 className="text-sm font-semibold tracking-tight">Add-ons</h3>
    <Controller
      control={form.control}
      name="addons"
      render={({ field }) => (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ADDONS.map((a) => {
            const checked = field.value.includes(a.id);
            return (
              <label key={a.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm">
                <Checkbox
                  checked={checked}
                  onChange={(e) => {
                    const cur = field.value;
                    field.onChange(
                      e.target.checked ? [...cur, a.id] : cur.filter((id) => id !== a.id),
                    );
                  }}
                />
                <span>
                  <span className="flex items-center justify-between gap-2 font-medium">
                    {a.label}
                    <span className="text-foreground-muted">\${a.price}/mo</span>
                  </span>
                  <span className="block text-xs text-foreground-muted">{a.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    />
  </div>

  <Controller
    control={form.control}
    name="billingAddress"
    render={({ field }) => (
      <AddressCard values={field.value} onSave={(v) => field.onChange(v)} />
    )}
  />

  <div className="flex justify-end">
    <Button type="submit" variant="primary">Subscribe</Button>
  </div>
</Form>`}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-6">
        <SummaryStats control={form.control} />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold tracking-tight">Pick a plan</h3>
          <Controller
            control={form.control}
            name="plan"
            render={({ field }) => {
              const idx = PLANS.findIndex((p) => p.id === field.value);
              return (
                <RovingFocusGroup orientation="horizontal" defaultIndex={Math.max(0, idx)}>
                  <div
                    role="radiogroup"
                    aria-label="Pick a plan"
                    className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                  >
                    {PLANS.map((p, i) => (
                      <PlanCard
                        key={p.id}
                        index={i}
                        plan={p}
                        selected={field.value === p.id}
                        onSelect={(id) => field.onChange(id)}
                      />
                    ))}
                  </div>
                </RovingFocusGroup>
              );
            }}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold tracking-tight">
            {t('forms.cards.multiSelect.title')}
          </h3>
          <p className="text-xs text-foreground-muted">
            {t('forms.cards.multiSelect.description')}
          </p>
          <Controller
            control={form.control}
            name="addons"
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ADDONS.map((a) => {
                  const checked = field.value.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                        checked
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-surface-muted/40',
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(e) => {
                          const cur = field.value;
                          if (e.target.checked) {
                            field.onChange([...cur, a.id]);
                          } else {
                            field.onChange(cur.filter((id) => id !== a.id));
                          }
                        }}
                      />
                      <span>
                        <span className="flex items-center justify-between gap-2 font-medium">
                          {a.label}
                          <span className="text-foreground-muted">${a.price}/mo</span>
                        </span>
                        <span className="block text-xs text-foreground-muted">{a.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="billingAddress"
          render={({ field }) => (
            <AddressCard values={field.value} onSave={(v) => field.onChange(v)} />
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Subscribe
          </Button>
        </div>
      </Form>

      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
