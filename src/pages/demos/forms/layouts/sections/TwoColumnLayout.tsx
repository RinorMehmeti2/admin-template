import { useTranslation } from 'react-i18next';
import { Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';
import { COUNTRY_OPTIONS } from '../../_shared/data';

interface TwoColValues {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  notes: string;
}

const CODE = `<Form form={form} onSubmit={() => undefined} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <FormField label="First name" required>
    <Input {...form.register('firstName')} autoComplete="given-name" />
  </FormField>
  <FormField label="Last name" required>
    <Input {...form.register('lastName')} autoComplete="family-name" />
  </FormField>
  <FormField label="Street" required className="sm:col-span-2">
    <Input {...form.register('street')} autoComplete="address-line1" />
  </FormField>
  <FormField label="City" required>
    <Input {...form.register('city')} autoComplete="address-level2" />
  </FormField>
  <FormField label="ZIP" required>
    <Input {...form.register('zip')} autoComplete="postal-code" />
  </FormField>
  <FormField label="Country" required className="sm:col-span-2">
    <Select {...form.register('country')}>
      {COUNTRY_OPTIONS.map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </Select>
  </FormField>
  <FormField
    label="Notes"
    description="Full-width Textarea — spans both columns."
    className="sm:col-span-2"
  >
    <Textarea rows={3} {...form.register('notes')} />
  </FormField>
  <div className="flex justify-end sm:col-span-2">
    <Button type="submit" variant="primary">Save profile</Button>
  </div>
</Form>`;

export function TwoColumnLayout() {
  const { t } = useTranslation();
  const form = useForm<TwoColValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      zip: '',
      country: 'US',
      notes: '',
    },
  });
  return (
    <Section
      id="two-col"
      title={t('forms.layouts.twoCol.title')}
      description={t('forms.layouts.twoCol.description')}
      code={CODE}
    >
      <Form
        form={form}
        onSubmit={() => undefined}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <FormField label="First name" required>
          <Input {...form.register('firstName')} autoComplete="given-name" />
        </FormField>
        <FormField label="Last name" required>
          <Input {...form.register('lastName')} autoComplete="family-name" />
        </FormField>
        <FormField label="Street" required className="sm:col-span-2">
          <Input {...form.register('street')} autoComplete="address-line1" />
        </FormField>
        <FormField label="City" required>
          <Input {...form.register('city')} autoComplete="address-level2" />
        </FormField>
        <FormField label="ZIP" required>
          <Input {...form.register('zip')} autoComplete="postal-code" />
        </FormField>
        <FormField label="Country" required className="sm:col-span-2">
          <Select {...form.register('country')}>
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Notes"
          description="Full-width Textarea — spans both columns."
          className="sm:col-span-2"
        >
          <Textarea rows={3} {...form.register('notes')} />
        </FormField>
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" variant="primary">
            Save profile
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
