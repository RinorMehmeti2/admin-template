import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { Form, useForm, zodResolver } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { Alert } from '@/components/feedback/Alert';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface SummaryValues {
  title: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  contact: string;
}

const FIELD_ID = (name: keyof SummaryValues): string => `summary-${name}`;

export function ErrorSummarySection() {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(3, t('forms.zod.minLength', { count: 3 })),
        type: z.string().min(1, t('forms.zod.required')),
        description: z.string().min(10, t('forms.zod.minLength', { count: 10 })),
        priority: z.enum(['low', 'medium', 'high']),
        contact: z.string().email(t('forms.zod.invalidEmail')),
      }),
    [t],
  );

  const form = useForm<SummaryValues>({
    defaultValues: {
      title: '',
      type: '',
      description: '',
      priority: 'medium',
      contact: '',
    },
    resolver: zodResolver(schema),
  });
  const { errors } = form.formState;

  const errorList: Array<{ field: keyof SummaryValues; message: string; label: string }> = [];
  const labels: Record<keyof SummaryValues, string> = {
    title: 'Title',
    type: 'Type',
    description: 'Description',
    priority: 'Priority',
    contact: 'Contact email',
  };
  for (const key of Object.keys(labels) as Array<keyof SummaryValues>) {
    const err = errors[key];
    if (err?.message !== undefined) {
      errorList.push({ field: key, message: err.message, label: labels[key] });
    }
  }

  const code = `<Form form={form} onSubmit={() => undefined} className="space-y-4">
  {errorList.length > 0 ? (
    <Alert
      variant="danger"
      role="alert"
      title={
        <span className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {errorList.length} field{errorList.length === 1 ? '' : 's'} need attention
        </span>
      }
      description={
        <ul className="mt-2 space-y-1">
          {errorList.map((e) => (
            <li key={e.field}>
              <a
                href={\`#\${FIELD_ID(e.field)}\`}
                onClick={(ev) => {
                  ev.preventDefault();
                  const el = document.getElementById(FIELD_ID(e.field));
                  if (el !== null) {
                    el.focus();
                    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                  }
                }}
                className="underline decoration-dotted underline-offset-2"
              >
                {e.label}
              </a>
              <span className="text-foreground-subtle"> — {e.message}</span>
            </li>
          ))}
        </ul>
      }
    />
  ) : null}

  <div className="grid gap-4 sm:grid-cols-2">
    <FormField label="Title" required error={errors.title?.message}>
      <Input id={FIELD_ID('title')} {...form.register('title')} />
    </FormField>
    <FormField label="Type" required error={errors.type?.message}>
      <Select id={FIELD_ID('type')} {...form.register('type')}>
        <option value="">Select…</option>
        <option value="bug">Bug</option>
        <option value="feature">Feature request</option>
        <option value="task">Task</option>
      </Select>
    </FormField>
    <FormField
      label="Description"
      required
      description="Min 10 chars."
      error={errors.description?.message}
      className="sm:col-span-2"
    >
      <Textarea id={FIELD_ID('description')} rows={4} {...form.register('description')} />
    </FormField>
    <FormField label="Priority" error={errors.priority?.message}>
      <Select id={FIELD_ID('priority')} {...form.register('priority')}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>
    </FormField>
    <FormField label="Contact email" required error={errors.contact?.message}>
      <Input id={FIELD_ID('contact')} type="email" {...form.register('contact')} />
    </FormField>
  </div>

  <div className="flex justify-end">
    <Button type="submit" variant="primary">
      Create ticket
    </Button>
  </div>
</Form>`;

  return (
    <Section
      id="summary"
      title={t('forms.validation.summary.title')}
      description={t('forms.validation.summary.description')}
      code={code}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        {errorList.length > 0 ? (
          <Alert
            variant="danger"
            role="alert"
            title={
              <span className="inline-flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {errorList.length} field{errorList.length === 1 ? '' : 's'} need attention
              </span>
            }
            description={
              <ul className="mt-2 space-y-1">
                {errorList.map((e) => (
                  <li key={e.field}>
                    <a
                      href={`#${FIELD_ID(e.field)}`}
                      onClick={(ev) => {
                        ev.preventDefault();
                        const el = document.getElementById(FIELD_ID(e.field));
                        if (el !== null) {
                          el.focus();
                          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }
                      }}
                      className="underline decoration-dotted underline-offset-2 hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {e.label}
                    </a>
                    <span className="text-foreground-subtle"> — {e.message}</span>
                  </li>
                ))}
              </ul>
            }
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" required error={errors.title?.message}>
            <Input id={FIELD_ID('title')} {...form.register('title')} />
          </FormField>
          <FormField label="Type" required error={errors.type?.message}>
            <Select id={FIELD_ID('type')} {...form.register('type')}>
              <option value="">Select…</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature request</option>
              <option value="task">Task</option>
            </Select>
          </FormField>
          <FormField
            label="Description"
            required
            description="Min 10 chars."
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <Textarea id={FIELD_ID('description')} rows={4} {...form.register('description')} />
          </FormField>
          <FormField label="Priority" error={errors.priority?.message}>
            <Select id={FIELD_ID('priority')} {...form.register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>
          <FormField label="Contact email" required error={errors.contact?.message}>
            <Input id={FIELD_ID('contact')} type="email" {...form.register('contact')} />
          </FormField>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Create ticket
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
