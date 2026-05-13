import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Form, useForm, zodResolver } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface SyncValues {
  email: string;
  password: string;
}

export function SyncZodSection() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState<SyncValues | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('forms.zod.required')).email(t('forms.zod.invalidEmail')),
        password: z
          .string()
          .min(1, t('forms.zod.required'))
          .min(8, t('forms.zod.minLength', { count: 8 })),
      }),
    [t],
  );

  const form = useForm<SyncValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(schema),
  });
  const { errors } = form.formState;

  return (
    <Section
      id="sync"
      title={t('forms.validation.sync.title')}
      description={t('forms.validation.sync.description')}
    >
      <Form
        form={form}
        onSubmit={(values) => {
          setSubmitted(values);
        }}
        className="space-y-4"
      >
        <FormField label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...form.register('email')} />
        </FormField>
        <FormField label="Password" required error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register('password')} />
        </FormField>
        <div className="flex items-center justify-between">
          <p className="text-xs text-foreground-muted">
            Submit blanks to see both errors fire and focus jump to the first.
          </p>
          <Button type="submit" variant="primary">
            Sign in
          </Button>
        </div>
        {submitted !== null ? (
          <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success-foreground">
            Validated. Submitted email: {submitted.email}
          </p>
        ) : null}
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
