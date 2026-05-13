import { useTranslation } from 'react-i18next';
import { Controller, Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { FormField } from '@/components/forms/FormField';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface CompactValues {
  language: string;
  region: string;
  fontSize: 'sm' | 'md' | 'lg';
  highContrast: boolean;
  reduceMotion: boolean;
}

export function CompactDensityLayout() {
  const { t } = useTranslation();
  const form = useForm<CompactValues>({
    defaultValues: {
      language: 'en',
      region: 'US',
      fontSize: 'md',
      highContrast: false,
      reduceMotion: false,
    },
  });

  return (
    <Section
      id="compact"
      title={t('forms.layouts.floating.title')}
      description={t('forms.layouts.floating.description')}
    >
      <Form
        form={form}
        onSubmit={() => undefined}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <FormField label="Language">
          <Input inputSize="sm" {...form.register('language')} />
        </FormField>
        <FormField label="Region">
          <Select selectSize="sm" {...form.register('region')}>
            <option value="US">United States</option>
            <option value="EU">European Union</option>
            <option value="JP">Japan</option>
          </Select>
        </FormField>
        <FormField label="Font size">
          <Select selectSize="sm" {...form.register('fontSize')}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </Select>
        </FormField>
        <div className="flex items-end">
          <label htmlFor="compact-highContrast" className="flex items-center gap-2 text-sm">
            <Controller
              control={form.control}
              name="highContrast"
              render={({ field }) => (
                <Switch
                  id="compact-highContrast"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            High contrast
          </label>
        </div>
        <div className="flex items-end">
          <label htmlFor="compact-reduceMotion" className="flex items-center gap-2 text-sm">
            <Controller
              control={form.control}
              name="reduceMotion"
              render={({ field }) => (
                <Switch
                  id="compact-reduceMotion"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            Reduce motion
          </label>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
