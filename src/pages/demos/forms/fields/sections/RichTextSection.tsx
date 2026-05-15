import { useTranslation } from 'react-i18next';
import { Controller, useForm } from '@/components/forms/Form';
import { Form } from '@/components/forms/Form';
import { LazyRichTextEditor } from '@/components/forms/RichTextEditor/lazy';
import { FormField } from '@/components/forms/FormField';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface RichValues {
  bio: string;
}

const SAMPLE_HTML =
  '<p>I work on <strong>design systems</strong> and <em>accessible</em> UIs.</p>' +
  '<ul><li>10 years of TypeScript</li><li>WCAG AA enforcer</li></ul>';

export function RichTextSection() {
  const { t } = useTranslation();
  const form = useForm<RichValues>({
    defaultValues: { bio: SAMPLE_HTML },
  });

  return (
    <Section
      id="rich"
      title={t('forms.fields.rich.title')}
      description={t('forms.fields.rich.description')}
      code={`<Form form={form} onSubmit={() => undefined}>
  <FormField label="Bio" description="LazyRichTextEditor — TipTap loads on demand.">
    <Controller
      control={form.control}
      name="bio"
      render={({ field }) => (
        <LazyRichTextEditor
          value={field.value}
          onChange={(html) => field.onChange(html)}
          minHeight={160}
        />
      )}
    />
  </FormField>
</Form>`}
    >
      <Form form={form} onSubmit={() => undefined}>
        <FormField label="Bio" description="LazyRichTextEditor — TipTap loads on demand.">
          <Controller
            control={form.control}
            name="bio"
            render={({ field }) => (
              <LazyRichTextEditor
                value={field.value}
                onChange={(html) => field.onChange(html)}
                minHeight={160}
              />
            )}
          />
        </FormField>
      </Form>

      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
