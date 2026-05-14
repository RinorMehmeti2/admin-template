import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Form, FormField, Input, NumberInput, Textarea, useForm, zodResolver } from '@/components/forms';
import { Select } from '@/components/forms/Select';
import { Card, CardContent } from '@/components/data-display/Card';
import { useToast } from '@/context/ToastProvider';
import { BounceIn } from '@/components/motion';
import { OrderReceipt, type ReceiptLine } from './OrderReceipt';

const ITEMS = [
  { id: 'classic', name: 'Classic butter croissant', price: 3.5 },
  { id: 'chocolate', name: 'Pain au chocolat', price: 4.0 },
  { id: 'almond', name: 'Almond croissant', price: 4.5 },
  { id: 'cinnamon', name: 'Cinnamon roll', price: 4.25 },
  { id: 'kouign', name: 'Kouign-amann', price: 5.0 },
] as const;

const itemSchema = z.object({
  itemId: z.string().min(1),
  qty: z.number().int().min(1).max(99),
});

const schema = z.object({
  customer: z.string().min(1),
  notes: z.string(),
  items: z.array(itemSchema).min(1),
});

type Values = z.infer<typeof schema>;

const DEFAULTS: Values = {
  customer: '',
  notes: '',
  items: [{ itemId: 'classic', qty: 1 }],
};

interface QuickOrderFormProps {
  onPlaced?: () => void;
}

export function QuickOrderForm({ onPlaced }: QuickOrderFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [placed, setPlaced] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
    mode: 'onBlur',
  });
  const { control, register, reset, formState } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watched = useWatch({ control });

  const lines: ReceiptLine[] = useMemo(() => {
    const items = (watched.items ?? []) as ReadonlyArray<{ itemId?: string; qty?: number }>;
    const out: ReceiptLine[] = [];
    items.forEach((row, idx) => {
      const meta = ITEMS.find((i) => i.id === row.itemId);
      if (meta === undefined) return;
      out.push({
        id: `${meta.id}-${idx}`,
        qty: row.qty ?? 1,
        name: meta.name,
        unitPrice: meta.price,
      });
    });
    return out;
  }, [watched.items]);

  const onSubmit = (values: Values) => {
    toast.success(t('croissant.forms.toast.placed'), {
      description: t('croissant.forms.toast.placedDesc', { name: values.customer }),
    });
    setPlaced(true);
    setTimeout(() => {
      reset(DEFAULTS);
      setPlaced(false);
      onPlaced?.();
    }, 2000);
  };

  return (
    <Card variant="outlined" className="relative overflow-hidden">
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Form form={form} onSubmit={onSubmit} className="space-y-4">
            <FormField
              label={t('croissant.forms.field.customer')}
              required
              error={errors.customer?.message}
            >
              <Input
                placeholder={t('croissant.forms.field.customerPh')}
                {...register('customer')}
              />
            </FormField>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {t('croissant.forms.quick.lineItems')}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => append({ itemId: 'classic', qty: 1 })}
                >
                  {t('croissant.forms.quick.addLine')}
                </Button>
              </div>
              <ul className="space-y-2">
                {fields.map((field, idx) => (
                  <li key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <Select
                        aria-label={t('croissant.forms.quick.itemLabel', { n: idx + 1 })}
                        {...register(`items.${idx}.itemId` as const)}
                      >
                        {ITEMS.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-24">
                      <NumberInput
                        min={1}
                        max={99}
                        aria-label={t('croissant.forms.quick.qtyLabel', { n: idx + 1 })}
                        value={watched.items?.[idx]?.qty ?? 1}
                        onValueChange={(v) =>
                          form.setValue(`items.${idx}.qty` as const, v ?? 1, { shouldDirty: true })
                        }
                      />
                    </div>
                    <IconButton
                      type="button"
                      aria-label={t('croissant.forms.quick.removeLine', { n: idx + 1 })}
                      variant="ghost"
                      size="md"
                      disabled={fields.length <= 1}
                      onClick={() => remove(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </div>

            <FormField label={t('croissant.forms.field.notes')}>
              <Textarea rows={3} placeholder={t('croissant.forms.field.notesPh')} {...register('notes')} />
            </FormField>

            <div className="pt-2">
              <Button type="submit" leftIcon={<ShoppingBag className="h-4 w-4" />}>
                {t('croissant.forms.submit')}
              </Button>
            </div>
          </Form>

          <div className="space-y-3">
            {placed ? (
              <BounceIn>
                <Card variant="outlined" className="border-success/40 bg-success/10">
                  <CardContent className="text-center">
                    <p className="text-lg font-semibold text-success">
                      {t('croissant.forms.toast.placed')}
                    </p>
                    <p className="mt-1 text-sm text-foreground-muted">
                      {t('croissant.forms.quick.successDesc')}
                    </p>
                    <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          data-print="hide"
                          className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-bounce"
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </BounceIn>
            ) : (
              <OrderReceipt
                customer={watched.customer ?? ''}
                lines={lines}
                notes={watched.notes ?? ''}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
