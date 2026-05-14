import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Controller, Form, useForm, zodResolver } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Switch } from '@/components/forms/Switch';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface ConditionalValues {
  hasDiscount: boolean;
  discountCode: string;
}

export function ConditionalSection() {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      z
        .object({
          hasDiscount: z.boolean(),
          discountCode: z.string(),
        })
        .superRefine((data, ctx) => {
          if (data.hasDiscount && data.discountCode.trim() === '') {
            ctx.addIssue({
              code: 'custom',
              path: ['discountCode'],
              message: t('forms.zod.discountRequired'),
            });
          }
        }),
    [t],
  );

  const form = useForm<ConditionalValues>({
    defaultValues: { hasDiscount: false, discountCode: '' },
    resolver: zodResolver(schema),
  });
  const hasDiscount = form.watch('hasDiscount');

  const code = `<Form form={form} onSubmit={() => undefined} className="space-y-4">
  <label htmlFor="conditional-hasDiscount" className="flex items-center gap-3 text-sm">
    <Controller
      control={form.control}
      name="hasDiscount"
      render={({ field }) => (
        <Switch
          id="conditional-hasDiscount"
          checked={field.value}
          onChange={(e) => field.onChange(e.target.checked)}
        />
      )}
    />
    Has discount?
  </label>
  <FormField
    label="Discount code"
    required={hasDiscount}
    error={form.formState.errors.discountCode?.message}
  >
    <Input
      {...form.register('discountCode')}
      disabled={!hasDiscount}
      placeholder={hasDiscount ? 'SUMMER25' : 'Enable the switch above'}
    />
  </FormField>
  <div className="flex justify-end">
    <Button type="submit" variant="primary">
      Apply
    </Button>
  </div>
</Form>`;

  return (
    <Section
      id="conditional"
      title={t('forms.validation.conditional.title')}
      description={t('forms.validation.conditional.description')}
      code={code}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <label htmlFor="conditional-hasDiscount" className="flex items-center gap-3 text-sm">
          <Controller
            control={form.control}
            name="hasDiscount"
            render={({ field }) => (
              <Switch
                id="conditional-hasDiscount"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          Has discount?
        </label>
        <FormField
          label="Discount code"
          required={hasDiscount}
          error={form.formState.errors.discountCode?.message}
        >
          <Input
            {...form.register('discountCode')}
            disabled={!hasDiscount}
            placeholder={hasDiscount ? 'SUMMER25' : 'Enable the switch above'}
          />
        </FormField>
        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Apply
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
