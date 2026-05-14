import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { Form, useForm, zodResolver } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { ApiError, useApiFormSubmit, useApiMutation } from '@/data';
import { Section } from '../../_shared/Section';

interface FeedbackValues {
  subject: string;
  body: string;
}

async function fakeSubmit(values: FeedbackValues): Promise<{ id: string }> {
  await new Promise((r) => setTimeout(r, 800));
  if (values.subject.toLowerCase().includes('fail')) {
    throw new ApiError({
      status: 422,
      code: 'validation_failed',
      message: 'Validation failed',
      payload: { errors: { subject: 'Subject contains a reserved word' } },
    });
  }
  return { id: `fb-${Date.now().toString(36)}` };
}

const CODE = `const schema = z.object({
  subject: z.string().min(1, t('forms.zod.required')),
  body: z.string().min(10, t('forms.zod.minLength', { count: 10 })),
});

const form = useForm<FeedbackValues>({
  defaultValues: { subject: '', body: '' },
  resolver: zodResolver(schema),
});

const mutation = useApiMutation<{ id: string }, FeedbackValues>(
  (values) => fakeSubmit(values),
  { meta: { handlesErrors: true } },
);
const onSubmit = useApiFormSubmit(form, mutation, {
  onSuccess: (data) => {
    setSubmittedId(data.id);
    form.reset();
  },
});

<Form form={form} onSubmit={onSubmit} className="space-y-4">
  <fieldset disabled={mutation.isPending} className="space-y-4">
    <FormField label="Subject" required error={form.formState.errors.subject?.message}>
      <Input {...form.register('subject')} placeholder="Type 'fail' to see a server error." />
    </FormField>
    <FormField label="Message" required error={form.formState.errors.body?.message}>
      <Textarea rows={4} {...form.register('body')} />
    </FormField>
  </fieldset>
  <div className="flex items-center justify-between">
    {submittedId !== null ? (
      <span className="inline-flex items-center gap-2 text-xs text-success-foreground">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Submitted · {submittedId}
      </span>
    ) : (
      <span />
    )}
    <Button type="submit" variant="primary" isLoading={mutation.isPending}>
      Send feedback
    </Button>
  </div>
</Form>`;

export function AsyncSubmitSection() {
  const { t } = useTranslation();
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const schema = z.object({
    subject: z.string().min(1, t('forms.zod.required')),
    body: z.string().min(10, t('forms.zod.minLength', { count: 10 })),
  });

  const form = useForm<FeedbackValues>({
    defaultValues: { subject: '', body: '' },
    resolver: zodResolver(schema),
  });

  const mutation = useApiMutation<{ id: string }, FeedbackValues>((values) => fakeSubmit(values), {
    meta: { handlesErrors: true },
  });
  const onSubmit = useApiFormSubmit(form, mutation, {
    onSuccess: (data) => {
      setSubmittedId(data.id);
      form.reset();
    },
  });

  return (
    <Section
      id="submit"
      title={t('forms.async.submit.title')}
      description={t('forms.async.submit.description')}
      code={CODE}
    >
      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        <fieldset disabled={mutation.isPending} className="space-y-4">
          <FormField label="Subject" required error={form.formState.errors.subject?.message}>
            <Input {...form.register('subject')} placeholder="Type 'fail' to see a server error." />
          </FormField>
          <FormField label="Message" required error={form.formState.errors.body?.message}>
            <Textarea rows={4} {...form.register('body')} />
          </FormField>
        </fieldset>
        <div className="flex items-center justify-between">
          {submittedId !== null ? (
            <span className="inline-flex items-center gap-2 text-xs text-success-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Submitted · {submittedId}
            </span>
          ) : (
            <span />
          )}
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            Send feedback
          </Button>
        </div>
      </Form>
    </Section>
  );
}
