import { useTranslation } from 'react-i18next';
import { Controller, Form, useForm, useWatch } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { NumberInput } from '@/components/forms/NumberInput';
import { FormField } from '@/components/forms/FormField';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';
import { SHIPPING_METHODS, PAYMENT_METHODS } from '../../_shared/data';

interface CheckoutValues {
  name: string;
  email: string;
  shippingMethod: string;
  paymentMethod: string;
  itemCount: number;
  itemPrice: number;
}

function SummaryTable({ control }: { control: ReturnType<typeof useForm<CheckoutValues>>['control'] }) {
  const values = useWatch({ control });
  const subtotal = (values.itemCount ?? 0) * (values.itemPrice ?? 0);
  const shipping =
    SHIPPING_METHODS.find((m) => m.id === values.shippingMethod)?.flatRate ?? 0;
  const total = subtotal + shipping;
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  return (
    <div className="rounded-md border border-border bg-surface">
      <Table size="dense" containerClassName="rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell className="text-right text-foreground-muted">{values.name ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell className="text-right text-foreground-muted">
              {values.email ?? '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Shipping</TableCell>
            <TableCell className="text-right text-foreground-muted">
              {SHIPPING_METHODS.find((m) => m.id === values.shippingMethod)?.label ?? '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Payment</TableCell>
            <TableCell className="text-right text-foreground-muted">
              {PAYMENT_METHODS.find((p) => p.id === values.paymentMethod)?.label ?? '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Items</TableCell>
            <TableCell className="text-right tabular-nums">{values.itemCount ?? 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Subtotal</TableCell>
            <TableCell className="text-right tabular-nums">{fmt(subtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Shipping</TableCell>
            <TableCell className="text-right tabular-nums">{fmt(shipping)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">Total</TableCell>
            <TableCell className="text-right text-base font-semibold tabular-nums">
              {fmt(total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export function ReadOnlySummarySection() {
  const { t } = useTranslation();
  const form = useForm<CheckoutValues>({
    defaultValues: {
      name: 'Alex Kowalski',
      email: 'alex@acme.test',
      shippingMethod: 'standard',
      paymentMethod: 'card',
      itemCount: 3,
      itemPrice: 49,
    },
  });

  return (
    <Section
      id="summary"
      title={t('forms.tables.summary.title')}
      description={t('forms.tables.summary.description')}
    >
      <Form form={form} onSubmit={() => undefined} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Name">
              <Input {...form.register('name')} />
            </FormField>
            <FormField label="Email">
              <Input type="email" {...form.register('email')} />
            </FormField>
            <FormField label="Shipping method">
              <Select {...form.register('shippingMethod')}>
                {SHIPPING_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} (+${m.flatRate})
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Payment method">
              <Select {...form.register('paymentMethod')}>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Items">
              <Controller
                control={form.control}
                name="itemCount"
                render={({ field }) => (
                  <NumberInput
                    min={0}
                    step={1}
                    precision={0}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v ?? 0)}
                  />
                )}
              />
            </FormField>
            <FormField label="Unit price">
              <Controller
                control={form.control}
                name="itemPrice"
                render={({ field }) => (
                  <NumberInput
                    min={0}
                    step={0.01}
                    precision={2}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v ?? 0)}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold tracking-tight">Review</p>
          <SummaryTable control={form.control} />
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
