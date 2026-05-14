import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Controller } from 'react-hook-form';
import { Building2, CheckCircle2, Package, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { FormField, Input, NumberInput, Textarea } from '@/components/forms';
import { Select } from '@/components/forms/Select';
import { Radio } from '@/components/forms/Radio';
import { RadioGroup } from '@/components/forms/RadioGroup';
import { FormWizard, FormWizardStep } from '@/components/forms/FormWizard';
import { BounceIn } from '@/components/motion';
import { useToast } from '@/context/ToastProvider';

const bakerySchema = z.object({
  name: z.string().min(2),
  contact: z.string().min(2),
  size: z.enum(['small', 'medium', 'large']),
});

const itemsSchema = z.object({
  product: z.string().min(1),
  units: z.number().int().min(50).max(10000),
  schedule: z.enum(['daily', 'weekly', 'monthly']),
});

const deliverySchema = z.object({
  address: z.string().min(2),
  window: z.enum(['morning', 'afternoon', 'evening']),
  notes: z.string(),
});

const schema = bakerySchema.merge(itemsSchema).merge(deliverySchema);
type Values = z.infer<typeof schema>;

const DEFAULTS: Values = {
  name: '',
  contact: '',
  size: 'small',
  product: 'classic',
  units: 100,
  schedule: 'weekly',
  address: '',
  window: 'morning',
  notes: '',
};

export function WholesaleWizard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [done, setDone] = useState<Values | null>(null);

  const handleSubmit = (values: Values) => {
    setDone(values);
    toast.success(t('croissant.forms.wholesale.toastTitle'), {
      description: t('croissant.forms.wholesale.toastDesc', { name: values.name }),
    });
  };

  if (done !== null) {
    return (
      <BounceIn>
        <Card variant="outlined" className="border-success/40 bg-success/10">
          <CardContent className="space-y-3 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <p className="text-lg font-semibold text-foreground">
              {t('croissant.forms.wholesale.successTitle')}
            </p>
            <p className="text-sm text-foreground-muted">
              {t('croissant.forms.wholesale.successDesc', { name: done.name })}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Badge variant="primary" size="md">
                {done.units} {t('croissant.forms.wholesale.unitsShort')}
              </Badge>
              <Badge variant="info" size="md">
                {t(`croissant.forms.wholesale.scheduleOption.${done.schedule}`)}
              </Badge>
              <Badge variant="success" size="md">
                {t(`croissant.forms.wholesale.window.${done.window}`)}
              </Badge>
            </div>
            <Button variant="outline" onClick={() => setDone(null)}>
              {t('croissant.forms.wholesale.startOver')}
            </Button>
          </CardContent>
        </Card>
      </BounceIn>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <FormWizard
          schema={schema}
          defaultValues={DEFAULTS}
          onSubmit={handleSubmit}
          stepShape="circle"
          stepIndicatorVariant="numbered"
        >
          <FormWizardStep<Values>
            id="bakery"
            title={t('croissant.forms.wholesale.step.bakery')}
            icon={<Building2 className="h-4 w-4" />}
            schema={bakerySchema}
            render={({ form }) => (
              <div className="space-y-4">
                <FormField
                  label={t('croissant.forms.wholesale.field.name')}
                  required
                  error={form.formState.errors.name?.message}
                >
                  <Input {...form.register('name')} />
                </FormField>
                <FormField
                  label={t('croissant.forms.wholesale.field.contact')}
                  required
                  error={form.formState.errors.contact?.message}
                >
                  <Input {...form.register('contact')} />
                </FormField>
                <FormField label={t('croissant.forms.wholesale.field.size')}>
                  <Controller
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <RadioGroup
                        name={field.name}
                        orientation="horizontal"
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as Values['size'])}
                      >
                        <Radio value="small">{t('croissant.forms.wholesale.sizeOption.small')}</Radio>
                        <Radio value="medium">{t('croissant.forms.wholesale.sizeOption.medium')}</Radio>
                        <Radio value="large">{t('croissant.forms.wholesale.sizeOption.large')}</Radio>
                      </RadioGroup>
                    )}
                  />
                </FormField>
              </div>
            )}
          />

          <FormWizardStep<Values>
            id="items"
            title={t('croissant.forms.wholesale.step.items')}
            icon={<Package className="h-4 w-4" />}
            schema={itemsSchema}
            render={({ form }) => (
              <div className="space-y-4">
                <FormField label={t('croissant.forms.wholesale.field.product')}>
                  <Select {...form.register('product')}>
                    <option value="classic">Classic croissant</option>
                    <option value="chocolate">Pain au chocolat</option>
                    <option value="almond">Almond croissant</option>
                  </Select>
                </FormField>
                <FormField
                  label={t('croissant.forms.wholesale.field.units')}
                  error={form.formState.errors.units?.message}
                >
                  <Controller
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                      <NumberInput
                        min={50}
                        max={10000}
                        step={50}
                        value={field.value ?? null}
                        onValueChange={(v) => field.onChange(v ?? 50)}
                      />
                    )}
                  />
                </FormField>
                <FormField label={t('croissant.forms.wholesale.field.schedule')}>
                  <Select {...form.register('schedule')}>
                    <option value="daily">{t('croissant.forms.wholesale.scheduleOption.daily')}</option>
                    <option value="weekly">{t('croissant.forms.wholesale.scheduleOption.weekly')}</option>
                    <option value="monthly">{t('croissant.forms.wholesale.scheduleOption.monthly')}</option>
                  </Select>
                </FormField>
              </div>
            )}
          />

          <FormWizardStep<Values>
            id="delivery"
            title={t('croissant.forms.wholesale.step.delivery')}
            icon={<Truck className="h-4 w-4" />}
            schema={deliverySchema}
            render={({ form }) => (
              <div className="space-y-4">
                <FormField
                  label={t('croissant.forms.wholesale.field.address')}
                  required
                  error={form.formState.errors.address?.message}
                >
                  <Input {...form.register('address')} />
                </FormField>
                <FormField label={t('croissant.forms.wholesale.field.window')}>
                  <Controller
                    control={form.control}
                    name="window"
                    render={({ field }) => (
                      <RadioGroup
                        name={field.name}
                        orientation="horizontal"
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as Values['window'])}
                      >
                        <Radio value="morning">{t('croissant.forms.wholesale.window.morning')}</Radio>
                        <Radio value="afternoon">{t('croissant.forms.wholesale.window.afternoon')}</Radio>
                        <Radio value="evening">{t('croissant.forms.wholesale.window.evening')}</Radio>
                      </RadioGroup>
                    )}
                  />
                </FormField>
                <FormField label={t('croissant.forms.wholesale.field.notes')}>
                  <Textarea rows={3} {...form.register('notes')} />
                </FormField>
              </div>
            )}
          />
        </FormWizard>
      </CardContent>
    </Card>
  );
}
