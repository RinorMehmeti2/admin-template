import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Form, useForm, zodResolver } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface CrossValues {
  password: string;
  confirm: string;
}

export function CrossFieldSection() {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(1, t('forms.zod.required'))
            .min(8, t('forms.zod.minLength', { count: 8 })),
          confirm: z.string().min(1, t('forms.zod.required')),
        })
        .superRefine((data, ctx) => {
          if (data.confirm !== data.password) {
            ctx.addIssue({
              code: 'custom',
              path: ['confirm'],
              message: t('forms.zod.passwordMatch'),
            });
          }
        }),
    [t],
  );

  const form = useForm<CrossValues>({
    defaultValues: { password: '', confirm: '' },
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });
  const { errors } = form.formState;

  return (
    <Section
      id="cross"
      title={t('forms.validation.cross.title')}
      description={t('forms.validation.cross.description')}
    >
      <Form
        form={form}
        onSubmit={() => undefined}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <FormField label="New password" required error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register('password')} />
        </FormField>
        <FormField label="Confirm password" required error={errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" {...form.register('confirm')} />
        </FormField>
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" variant="primary">
            Update password
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
