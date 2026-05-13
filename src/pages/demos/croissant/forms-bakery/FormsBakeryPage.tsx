import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Controller, useWatch } from 'react-hook-form';
import { Croissant as CroissantIcon, ShoppingBag, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
} from '@/components/forms/Combobox';
import { Checkbox } from '@/components/forms/Checkbox';
import { DatePicker } from '@/components/forms/DatePicker';
import {
  Form,
  FormField,
  Input,
  NumberInput,
  Radio,
  RadioGroup,
  Rating,
  Slider,
  Switch,
  TagInput,
  Textarea,
  TimePicker,
  useForm,
  zodResolver,
} from '@/components/forms';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/data-display/Card';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/context/ToastProvider';
import { ComponentsUsedFooter, SectionHeader } from '../_shared';

type Delivery = 'pickup' | 'dine-in' | 'courier';

interface OrderValues {
  customer: string;
  pastry: string;
  quantity: number;
  pickupDate: Date | null;
  pickupTime: string;
  delivery: Delivery;
  giftWrap: boolean;
  sweetness: number;
  allergies: string[];
  urgency: number;
  notes: string;
  terms: boolean;
}

const COMPONENTS = [
  'Form',
  'FormField',
  'Input',
  'Combobox',
  'NumberInput',
  'DatePicker',
  'TimePicker',
  'RadioGroup',
  'Radio',
  'Switch',
  'Slider',
  'TagInput',
  'Rating',
  'Textarea',
  'Checkbox',
  'Button',
  'Card',
  'Badge',
  'ConfirmDialog',
  'Toast',
];

const DEFAULTS: OrderValues = {
  customer: '',
  pastry: '',
  quantity: 1,
  pickupDate: null,
  pickupTime: '',
  delivery: 'pickup',
  giftWrap: false,
  sweetness: 5,
  allergies: [],
  urgency: 3,
  notes: '',
  terms: false,
};

export function FormsBakeryPage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const PASTRIES = useMemo(
    () => [
      { id: 'classic', label: t('croissant.forms.pastry.classic') },
      { id: 'chocolate', label: t('croissant.forms.pastry.chocolate') },
      { id: 'almond', label: t('croissant.forms.pastry.almond') },
      { id: 'cinnamon', label: t('croissant.forms.pastry.cinnamon') },
      { id: 'kouign', label: t('croissant.forms.pastry.kouign') },
    ],
    [t],
  );

  const schema = useMemo(
    () =>
      z.object({
        customer: z.string().min(1, t('croissant.forms.validation.nameRequired')),
        pastry: z.string().min(1, t('croissant.forms.validation.pastryRequired')),
        quantity: z
          .number()
          .int()
          .min(1, t('croissant.forms.validation.quantityRange'))
          .max(100, t('croissant.forms.validation.quantityRange')),
        pickupDate: z
          .date()
          .nullable()
          .refine((v) => v !== null, {
            message: t('croissant.forms.validation.pickupDateRequired'),
          }),
        pickupTime: z.string().min(1, t('croissant.forms.validation.pickupTimeRequired')),
        delivery: z.enum(['pickup', 'dine-in', 'courier']),
        giftWrap: z.boolean(),
        sweetness: z.number().min(0).max(10),
        allergies: z.array(z.string()),
        urgency: z.number().min(1).max(5),
        notes: z.string(),
        terms: z.boolean().refine((v) => v === true, {
          message: t('croissant.forms.validation.termsRequired'),
        }),
      }),
    [t],
  );

  const form = useForm<OrderValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
    mode: 'onBlur',
  });
  const { control, register, formState, reset } = form;
  const { errors } = formState;

  const watched = useWatch({ control });

  const [pending, setPending] = useState<OrderValues | null>(null);

  const finalize = (values: OrderValues) => {
    toast.success(t('croissant.forms.toast.placed'), {
      description: t('croissant.forms.toast.placedDesc', { name: values.customer }),
    });
    reset(DEFAULTS);
    setPending(null);
  };

  const onSubmit = (values: OrderValues) => {
    if (values.quantity > 20) {
      setPending(values);
      return;
    }
    finalize(values);
  };

  const pastryLabel = useMemo(() => {
    if (watched.pastry === undefined || watched.pastry === '') return undefined;
    return PASTRIES.find((p) => p.id === watched.pastry)?.label;
  }, [watched.pastry, PASTRIES]);

  const deliveryLabel = useMemo(() => {
    const map: Record<Delivery, string> = {
      pickup: t('croissant.forms.field.deliveryPickup'),
      'dine-in': t('croissant.forms.field.deliveryDineIn'),
      courier: t('croissant.forms.field.deliveryCourier'),
    };
    return watched.delivery !== undefined ? map[watched.delivery as Delivery] : undefined;
  }, [watched.delivery, t]);

  const hasAnyValue =
    (watched.customer !== undefined && watched.customer !== '') ||
    pastryLabel !== undefined ||
    (watched.notes !== undefined && watched.notes !== '');

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title={t('croissant.forms.title')} description={t('croissant.forms.subtitle')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2" aria-labelledby="order-heading">
          <SectionHeader
            tone="primary"
            eyebrow={t('croissant.forms.section.orderEyebrow')}
            title={<span id="order-heading">{t('croissant.forms.section.order')}</span>}
          />

          <Card variant="outlined">
            <CardContent>
              <Form form={form} onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label={t('croissant.forms.field.customer')}
                    required
                    error={errors.customer?.message}
                  >
                    <Input
                      autoComplete="name"
                      placeholder={t('croissant.forms.field.customerPh')}
                      leftIcon={<User className="h-4 w-4" />}
                      {...register('customer')}
                    />
                  </FormField>

                  <FormField
                    label={t('croissant.forms.field.pastry')}
                    required
                    error={errors.pastry?.message}
                  >
                    <Controller
                      control={control}
                      name="pastry"
                      render={({ field }) => (
                        <Combobox
                          items={PASTRIES}
                          getItemLabel={(p) => p.label}
                          getItemValue={(p) => p.id}
                          value={field.value}
                          onValueChange={(v) =>
                            field.onChange(typeof v === 'string' ? v : (v[0] ?? ''))
                          }
                        >
                          <ComboboxTrigger placeholder={t('croissant.forms.field.pastryPh')} />
                          <ComboboxContent>
                            {PASTRIES.map((p, i) => (
                              <ComboboxItem
                                key={p.id}
                                index={i}
                                comboItem={{ kind: 'item', item: p }}
                              />
                            ))}
                          </ComboboxContent>
                        </Combobox>
                      )}
                    />
                  </FormField>

                  <FormField
                    label={t('croissant.forms.field.quantity')}
                    required
                    error={errors.quantity?.message}
                  >
                    <Controller
                      control={control}
                      name="quantity"
                      render={({ field }) => (
                        <NumberInput
                          min={1}
                          max={100}
                          value={field.value ?? null}
                          onValueChange={(v) => field.onChange(v ?? 0)}
                          leftIcon={<ShoppingBag className="h-4 w-4" />}
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label={t('croissant.forms.field.delivery')}
                    required
                    error={errors.delivery?.message}
                  >
                    <Controller
                      control={control}
                      name="delivery"
                      render={({ field }) => (
                        <RadioGroup
                          name={field.name}
                          orientation="horizontal"
                          value={field.value}
                          onValueChange={(v) => field.onChange(v as Delivery)}
                        >
                          <Radio value="pickup">{t('croissant.forms.field.deliveryPickup')}</Radio>
                          <Radio value="dine-in">{t('croissant.forms.field.deliveryDineIn')}</Radio>
                          <Radio value="courier">
                            {t('croissant.forms.field.deliveryCourier')}
                          </Radio>
                        </RadioGroup>
                      )}
                    />
                  </FormField>

                  <FormField
                    label={t('croissant.forms.field.pickupDate')}
                    required
                    error={errors.pickupDate?.message}
                  >
                    <Controller
                      control={control}
                      name="pickupDate"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          minDate={new Date()}
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label={t('croissant.forms.field.pickupTime')}
                    required
                    error={errors.pickupTime?.message}
                  >
                    <Controller
                      control={control}
                      name="pickupTime"
                      render={({ field }) => (
                        <TimePicker
                          value={field.value}
                          onChange={(v) =>
                            field.onChange(typeof v === 'string' ? v : (v?.toString() ?? ''))
                          }
                          step={15}
                          format="24h"
                        />
                      )}
                    />
                  </FormField>
                </div>

                <FormField label={t('croissant.forms.field.allergies')}>
                  <Controller
                    control={control}
                    name="allergies"
                    render={({ field }) => (
                      <TagInput<string>
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('croissant.forms.field.allergiesPh')}
                      />
                    )}
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label={t('croissant.forms.field.sweetness')}>
                    <Controller
                      control={control}
                      name="sweetness"
                      render={({ field }) => (
                        <div className="flex items-center gap-3">
                          <Slider
                            value={field.value}
                            onValueChange={field.onChange}
                            min={0}
                            max={10}
                            step={1}
                            aria-label={t('croissant.forms.field.sweetness')}
                            className="flex-1"
                          />
                          <Badge variant="primary" size="sm" className="tabular-nums">
                            {field.value}
                          </Badge>
                        </div>
                      )}
                    />
                  </FormField>

                  <FormField label={t('croissant.forms.field.urgency')}>
                    <Controller
                      control={control}
                      name="urgency"
                      render={({ field }) => (
                        <Rating
                          value={field.value}
                          onValueChange={field.onChange}
                          max={5}
                          aria-label={t('croissant.forms.field.urgency')}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <FormField label={t('croissant.forms.field.notes')}>
                  <Textarea
                    rows={3}
                    placeholder={t('croissant.forms.field.notesPh')}
                    {...register('notes')}
                  />
                </FormField>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <Switch {...register('giftWrap')} />
                    <span>{t('croissant.forms.field.giftWrap')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <Checkbox {...register('terms')} aria-invalid={errors.terms !== undefined} />
                    <span>{t('croissant.forms.field.terms')}</span>
                  </label>
                </div>
                {errors.terms?.message !== undefined ? (
                  <p role="alert" className="text-xs text-danger">
                    {errors.terms.message}
                  </p>
                ) : null}

                <div className="pt-2">
                  <Button type="submit" leftIcon={<CroissantIcon className="h-4 w-4" />}>
                    {t('croissant.forms.submit')}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <SectionHeader
            tone="info"
            eyebrow={t('croissant.forms.section.summaryEyebrow')}
            title={t('croissant.forms.section.summary')}
          />
          <Card variant="outlined" className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle>{t('croissant.forms.section.summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {!hasAnyValue ? (
                <p className="text-foreground-muted">{t('croissant.forms.summary.empty')}</p>
              ) : (
                <ul className="space-y-1.5">
                  {watched.customer !== undefined && watched.customer !== '' ? (
                    <li className="font-medium text-foreground">{watched.customer}</li>
                  ) : null}
                  {pastryLabel !== undefined ? (
                    <li>
                      {t('croissant.forms.summary.qty', {
                        count: watched.quantity ?? 0,
                        item: pastryLabel,
                      })}
                    </li>
                  ) : null}
                  {deliveryLabel !== undefined ? (
                    <li className="text-foreground-muted">
                      {t('croissant.forms.summary.delivery', { method: deliveryLabel })}
                    </li>
                  ) : null}
                  {watched.giftWrap === true ? (
                    <li className="text-foreground-muted">{t('croissant.forms.summary.gift')}</li>
                  ) : null}
                  {watched.sweetness !== undefined ? (
                    <li className="text-foreground-muted">
                      {t('croissant.forms.summary.sweet', { value: watched.sweetness })}
                    </li>
                  ) : null}
                  {watched.urgency !== undefined && watched.urgency > 0 ? (
                    <li className="text-foreground-muted">
                      {t('croissant.forms.summary.urgency', { value: watched.urgency })}
                    </li>
                  ) : null}
                  {watched.allergies !== undefined && watched.allergies.length > 0 ? (
                    <li className="flex flex-wrap gap-1.5">
                      {watched.allergies.map((a) => (
                        <Badge key={a} variant="warning" size="sm">
                          {a}
                        </Badge>
                      ))}
                    </li>
                  ) : null}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={t('croissant.forms.confirm.title')}
        description={t('croissant.forms.confirm.body', { count: pending?.quantity ?? 0 })}
        confirmLabel={t('croissant.forms.confirm.ok')}
        cancelLabel={t('croissant.forms.confirm.cancel')}
        onConfirm={() => {
          if (pending !== null) finalize(pending);
        }}
      />

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
