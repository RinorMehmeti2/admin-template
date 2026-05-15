import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { Controller, Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { NumberInput } from '@/components/forms/NumberInput';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface NestedValues {
  orders: Array<{
    customer: string;
    lines: Array<{ sku: string; qty: number }>;
  }>;
}

const CODE = `// Top-level: useFieldArray for "orders". Each OrderCard hosts its own
// useFieldArray for "orders.\${i}.lines" — nested write paths via dot syntax.
<Form form={form} onSubmit={() => undefined} className="space-y-4">
  <div className="space-y-3">
    {fields.map((order, i) => (
      <OrderCard
        key={order.id}
        control={form.control}
        register={form.register}
        orderIndex={i}
        onRemove={() => remove(i)}
      />
    ))}
  </div>
  <div className="flex justify-between gap-2">
    <Button
      type="button"
      variant="outline"
      leftIcon={<Plus className="h-4 w-4" />}
      onClick={() => append({ customer: '', lines: [] })}
    >
      Add order
    </Button>
    <Button type="submit" variant="primary">Save all orders</Button>
  </div>
</Form>

// Inside OrderCard:
const { fields, append, remove } = useFieldArray({
  control,
  name: \`orders.\${orderIndex}.lines\`,
});
// …render <FormField>+<Input> + <NumberInput> per line, "Add line" appends.`;

function OrderCard({
  control,
  register,
  orderIndex,
  onRemove,
}: {
  control: ReturnType<typeof useForm<NestedValues>>['control'];
  register: ReturnType<typeof useForm<NestedValues>>['register'];
  orderIndex: number;
  onRemove: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `orders.${orderIndex}.lines`,
  });
  return (
    <Card variant="outlined">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="text-base">Order {orderIndex + 1}</CardTitle>
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Remove order ${orderIndex + 1}`}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6 pt-2">
        <FormField label="Customer">
          <Input {...register(`orders.${orderIndex}.customer`)} />
        </FormField>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
            Line items
          </p>
          {fields.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-foreground-muted">
              No line items.
            </p>
          ) : (
            fields.map((line, lineIndex) => (
              <div key={line.id} className="grid grid-cols-[1fr_5rem_auto] items-end gap-2">
                <FormField label={`SKU ${lineIndex + 1}`} hideLabel>
                  <Input
                    inputSize="sm"
                    placeholder="SKU"
                    {...register(`orders.${orderIndex}.lines.${lineIndex}.sku`)}
                  />
                </FormField>
                <Controller
                  control={control}
                  name={`orders.${orderIndex}.lines.${lineIndex}.qty`}
                  render={({ field }) => (
                    <NumberInput
                      inputSize="sm"
                      min={1}
                      step={1}
                      precision={0}
                      value={field.value}
                      onValueChange={(v) => field.onChange(v ?? 1)}
                      aria-label={`Order ${orderIndex + 1} line ${lineIndex + 1} qty`}
                    />
                  )}
                />
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove line ${lineIndex + 1}`}
                  onClick={() => remove(lineIndex)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            ))
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => append({ sku: '', qty: 1 })}
          >
            Add line
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function NestedRepeaterSection() {
  const { t } = useTranslation();
  const form = useForm<NestedValues>({
    defaultValues: {
      orders: [
        {
          customer: 'Amara Dao',
          lines: [
            { sku: 'SKU-0001', qty: 2 },
            { sku: 'SKU-0003', qty: 5 },
          ],
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'orders',
  });

  return (
    <Section
      id="nested"
      title={t('forms.repeater.nested.title')}
      description={t('forms.repeater.nested.description')}
      code={CODE}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <div className="space-y-3">
          {fields.map((order, i) => (
            <OrderCard
              key={order.id}
              control={form.control}
              register={form.register}
              orderIndex={i}
              onRemove={() => remove(i)}
            />
          ))}
        </div>
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => append({ customer: '', lines: [] })}
          >
            Add order
          </Button>
          <Button type="submit" variant="primary">
            Save all orders
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
