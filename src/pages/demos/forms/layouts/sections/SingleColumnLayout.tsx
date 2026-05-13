import { useTranslation } from 'react-i18next';
import { Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface SingleValues {
  title: string;
  description: string;
}

export function SingleColumnLayout() {
  const { t } = useTranslation();
  const form = useForm<SingleValues>({
    defaultValues: { title: '', description: '' },
  });
  return (
    <Section
      id="single"
      title={t('forms.layouts.single.title')}
      description={t('forms.layouts.single.description')}
    >
      <div className="mx-auto max-w-md">
        <Form form={form} onSubmit={() => undefined} className="space-y-4">
          <FormField label="Title" required>
            <Input {...form.register('title')} placeholder="Give it a name…" />
          </FormField>
          <FormField label="Description">
            <Textarea rows={4} {...form.register('description')} placeholder="Optional details…" />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Form>
        <PreviewPanel form={form} defaultOpen={false} />
      </div>
    </Section>
  );
}
