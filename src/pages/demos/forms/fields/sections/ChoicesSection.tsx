import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from '@/components/forms/Form';
import { Form } from '@/components/forms/Form';
import { Checkbox } from '@/components/forms/Checkbox';
import { Switch } from '@/components/forms/Switch';
import { Select } from '@/components/forms/Select';
import { RadioGroup } from '@/components/forms/RadioGroup';
import { Radio } from '@/components/forms/Radio';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
} from '@/components/forms/Combobox';
import { FormField } from '@/components/forms/FormField';
import { Label } from '@/components/forms/Label';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';
import { COUNTRY_OPTIONS, EMPLOYEE_DEPARTMENTS } from '../../_shared/data';

interface ChoiceValues {
  newsletter: boolean;
  notifications: boolean;
  role: 'admin' | 'editor' | 'viewer';
  department: string;
  country: string;
  skills: ReadonlyArray<string>;
}

const SKILLS = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'css', label: 'CSS' },
  { value: 'design-systems', label: 'Design systems' },
  { value: 'testing', label: 'Testing' },
  { value: 'i18n', label: 'i18n' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
];

export function ChoicesSection() {
  const { t } = useTranslation();
  const [skillItems] = useState(SKILLS);
  const form = useForm<ChoiceValues>({
    defaultValues: {
      newsletter: true,
      notifications: false,
      role: 'editor',
      department: 'Engineering',
      country: 'US',
      skills: ['react', 'typescript'],
    },
  });

  return (
    <Section
      id="choices"
      title={t('forms.fields.choices.title')}
      description={t('forms.fields.choices.description')}
      code={`<Form form={form} onSubmit={() => undefined} className="space-y-5">
  <div className="grid gap-4 sm:grid-cols-2">
    <label htmlFor="choices-newsletter" className="flex items-start gap-3">
      <Controller
        control={form.control}
        name="newsletter"
        render={({ field }) => (
          <Checkbox
            id="choices-newsletter"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />
      <span className="text-sm text-foreground">Send me the weekly newsletter</span>
    </label>

    <label htmlFor="choices-notifications" className="flex items-start gap-3">
      <Controller
        control={form.control}
        name="notifications"
        render={({ field }) => (
          <Switch
            id="choices-notifications"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />
      <span className="text-sm text-foreground">Push notifications</span>
    </label>
  </div>

  <FormField label="Role">
    <Controller
      control={form.control}
      name="role"
      render={({ field }) => (
        <RadioGroup name={field.name} value={field.value} onValueChange={field.onChange}>
          <Radio value="admin">Admin</Radio>
          <Radio value="editor">Editor</Radio>
          <Radio value="viewer">Viewer</Radio>
        </RadioGroup>
      )}
    />
  </FormField>

  <FormField label="Department">
    <Select {...form.register('department')}>
      {EMPLOYEE_DEPARTMENTS.map((d) => (
        <option key={d} value={d}>{d}</option>
      ))}
    </Select>
  </FormField>

  <Controller
    control={form.control}
    name="country"
    render={({ field }) => (
      <Combobox
        items={COUNTRY_OPTIONS}
        getItemLabel={(c) => c.label}
        getItemValue={(c) => c.code}
        value={field.value}
        onValueChange={(v) => field.onChange(typeof v === 'string' ? v : (v[0] ?? ''))}
      >
        <ComboboxTrigger id="fields-country" placeholder="Pick a country…" />
        <ComboboxContent>
          {COUNTRY_OPTIONS.map((c, i) => (
            <ComboboxItem key={c.code} index={i} comboItem={{ kind: 'item', item: c }} />
          ))}
        </ComboboxContent>
      </Combobox>
    )}
  />
</Form>`}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="choices-newsletter" className="flex items-start gap-3">
            <Controller
              control={form.control}
              name="newsletter"
              render={({ field }) => (
                <Checkbox
                  id="choices-newsletter"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <span className="text-sm text-foreground">
              Send me the weekly newsletter
              <span className="block text-xs text-foreground-muted">
                Tips, updates, and the occasional changelog.
              </span>
            </span>
          </label>

          <label htmlFor="choices-notifications" className="flex items-start gap-3">
            <Controller
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <Switch
                  id="choices-notifications"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <span className="text-sm text-foreground">
              Push notifications
              <span className="block text-xs text-foreground-muted">
                Browser pings when something needs action.
              </span>
            </span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Role">
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as ChoiceValues['role'])}
                >
                  <Radio value="admin">Admin</Radio>
                  <Radio value="editor">Editor</Radio>
                  <Radio value="viewer">Viewer</Radio>
                </RadioGroup>
              )}
            />
          </FormField>

          <FormField label="Department" description="Native <Select> styled.">
            <Select {...form.register('department')}>
              {EMPLOYEE_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fields-country">Country</Label>
            <Controller
              control={form.control}
              name="country"
              render={({ field }) => (
                <Combobox<{ code: string; label: string }>
                  items={COUNTRY_OPTIONS}
                  getItemLabel={(c) => c.label}
                  getItemValue={(c) => c.code}
                  value={field.value}
                  onValueChange={(v) => field.onChange(typeof v === 'string' ? v : (v[0] ?? ''))}
                >
                  <ComboboxTrigger id="fields-country" placeholder="Pick a country…" />
                  <ComboboxContent>
                    {COUNTRY_OPTIONS.map((c, i) => (
                      <ComboboxItem key={c.code} index={i} comboItem={{ kind: 'item', item: c }} />
                    ))}
                  </ComboboxContent>
                </Combobox>
              )}
            />
            <p className="text-xs text-foreground-muted">Single-select Combobox.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fields-skills">Skills</Label>
            <Controller
              control={form.control}
              name="skills"
              render={({ field }) => (
                <Combobox<{ value: string; label: string }>
                  items={skillItems}
                  getItemLabel={(s) => s.label}
                  getItemValue={(s) => s.value}
                  multiple
                  value={field.value as string[]}
                  onValueChange={(v) => {
                    if (Array.isArray(v)) field.onChange(v);
                  }}
                >
                  <ComboboxTrigger id="fields-skills" placeholder="Add skills…" />
                  <ComboboxContent>
                    {skillItems.map((s, i) => (
                      <ComboboxItem key={s.value} index={i} comboItem={{ kind: 'item', item: s }} />
                    ))}
                  </ComboboxContent>
                </Combobox>
              )}
            />
            <p className="text-xs text-foreground-muted">Multi-select Combobox.</p>
          </div>
        </div>
      </Form>

      <PreviewPanel form={form} />
    </Section>
  );
}
