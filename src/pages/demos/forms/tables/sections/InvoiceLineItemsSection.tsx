import { useMemo, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { z } from 'zod';
import {
  Controller,
  Form,
  useForm,
  useFormContext,
  useWatch,
  zodResolver,
} from '@/components/forms/Form';
import { useFieldArray } from 'react-hook-form';
import { Input } from '@/components/forms/Input';
import { NumberInput } from '@/components/forms/NumberInput';
import { Select } from '@/components/forms/Select';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
} from '@/components/forms/Combobox';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';
import { PRODUCTS, TAX_RATES, getProductBySku, type Product } from '../../_shared';
import { formatMoney } from '../../_shared/format';

interface InvoiceValues {
  vendor: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: 'USD' | 'EUR' | 'GBP';
  lines: Array<{
    sku: string;
    qty: number;
    unitPrice: number;
    taxRatePct: number;
  }>;
}

const CODE = `// zod schema + useFieldArray("lines"); LineTotal + Totals read via useWatch.
const schema = z.object({
  // …header fields,
  lines: z.array(z.object({
    sku: z.string().min(1),
    qty: z.number().int().min(1),
    unitPrice: z.number().nonnegative(),
    taxRatePct: z.number().min(0).max(100),
  })).min(1, 'At least one line'),
});

const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lines' });

<Table size="dense">
  <TableHeader>{/* Product · Qty · Unit price · Tax % · Line total · Remove */}</TableHeader>
  <TableBody>
    {fields.map((row, i) => (
      <TableRow key={row.id}>
        <TableCell>
          <Controller
            control={form.control}
            name={\`lines.\${i}.sku\`}
            render={({ field }) => (
              <Combobox<Product>
                items={PRODUCTS}
                getItemLabel={(p) => \`\${p.name} · \${p.sku}\`}
                getItemValue={(p) => p.sku}
                value={field.value}
                onValueChange={(v) => {
                  const sku = typeof v === 'string' ? v : (v[0] ?? '');
                  field.onChange(sku);
                  const product = getProductBySku(sku);
                  if (product !== undefined) {
                    form.setValue(\`lines.\${i}.unitPrice\`, product.unitPrice);
                    form.setValue(\`lines.\${i}.taxRatePct\`, product.taxRatePct);
                  }
                }}
              >
                <ComboboxTrigger placeholder="Pick a product…" />
                <ComboboxContent>{/* items */}</ComboboxContent>
              </Combobox>
            )}
          />
        </TableCell>
        <TableCell>
          <Controller control={form.control} name={\`lines.\${i}.qty\`} render={({ field }) => (
            <NumberInput min={1} max={999} value={field.value} onValueChange={(v) => field.onChange(v ?? 0)} />
          )} />
        </TableCell>
        <TableCell>
          <Controller control={form.control} name={\`lines.\${i}.unitPrice\`} render={({ field }) => (
            <NumberInput min={0} step={0.01} precision={2} value={field.value} onValueChange={(v) => field.onChange(v ?? 0)} />
          )} />
        </TableCell>
        <TableCell>{/* tax % Select */}</TableCell>
        <TableCell><LineTotal index={i} /></TableCell>
        <TableCell><IconButton onClick={() => remove(i)}><Trash2 /></IconButton></TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter><Totals /></TableFooter>
</Table>

// LineTotal / Totals read via useWatch + formatMoney(amount, currency).`;

function makeSchema(t: TFunction) {
  return z.object({
    vendor: z.string().min(1, t('forms.zod.required')),
    invoiceNumber: z.string().min(1, t('forms.zod.required')),
    issueDate: z.string().min(1, t('forms.zod.required')),
    dueDate: z.string().min(1, t('forms.zod.required')),
    currency: z.enum(['USD', 'EUR', 'GBP']),
    lines: z
      .array(
        z.object({
          sku: z.string().min(1, t('forms.zod.required')),
          qty: z
            .number({ message: t('forms.zod.required') })
            .int(t('forms.zod.integer'))
            .min(1, t('forms.zod.minQty')),
          unitPrice: z
            .number({ message: t('forms.zod.required') })
            .nonnegative(t('forms.zod.nonnegative')),
          taxRatePct: z
            .number({ message: t('forms.zod.required') })
            .min(0)
            .max(100),
        }),
      )
      .min(1, t('forms.zod.atLeastOneLine')),
  });
}

function LineTotal({ index }: { index: number }) {
  const { control } = useFormContext<InvoiceValues>();
  const line = useWatch({ control, name: `lines.${index}` });
  const currency = useWatch({ control, name: 'currency' });
  const total = (line?.qty ?? 0) * (line?.unitPrice ?? 0) * (1 + (line?.taxRatePct ?? 0) / 100);
  return <span className="tabular-nums">{formatMoney(total, currency)}</span>;
}

function Totals() {
  const { control } = useFormContext<InvoiceValues>();
  const lines = useWatch({ control, name: 'lines' });
  const currency = useWatch({ control, name: 'currency' });
  const subtotal = lines.reduce((s, l) => s + (l?.qty ?? 0) * (l?.unitPrice ?? 0), 0);
  const tax = lines.reduce(
    (s, l) => s + ((l?.qty ?? 0) * (l?.unitPrice ?? 0) * (l?.taxRatePct ?? 0)) / 100,
    0,
  );
  const total = subtotal + tax;
  return (
    <>
      <TableRow>
        <TableCell colSpan={4} className="text-right font-medium text-foreground-muted">
          Subtotal
        </TableCell>
        <TableCell className="text-right tabular-nums">{formatMoney(subtotal, currency)}</TableCell>
        <TableCell />
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} className="text-right font-medium text-foreground-muted">
          Tax
        </TableCell>
        <TableCell className="text-right tabular-nums">{formatMoney(tax, currency)}</TableCell>
        <TableCell />
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} className="text-right text-base font-semibold">
          Total
        </TableCell>
        <TableCell className="text-right text-base font-semibold tabular-nums">
          {formatMoney(total, currency)}
        </TableCell>
        <TableCell />
      </TableRow>
    </>
  );
}

export function InvoiceLineItemsSection() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const schema = useMemo(() => makeSchema(t), [t]);
  const form = useForm<InvoiceValues>({
    defaultValues: {
      vendor: 'Acme Hardware Co.',
      invoiceNumber: 'INV-2026-0042',
      issueDate: '2026-05-14',
      dueDate: '2026-06-13',
      currency: 'USD',
      lines: [
        { sku: 'SKU-0001', qty: 2, unitPrice: 129, taxRatePct: 7 },
        { sku: 'SKU-0003', qty: 5, unitPrice: 49, taxRatePct: 7 },
      ],
    },
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  const errors = form.formState.errors;

  return (
    <Section
      id="invoice"
      title={t('forms.tables.invoice.title')}
      description={t('forms.tables.invoice.description')}
      code={CODE}
    >
      <Form
        form={form}
        onSubmit={(values) => {
          setSubmitted(true);

          console.log('Invoice submitted', values);
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Vendor" required error={errors.vendor?.message}>
            <Input {...form.register('vendor')} />
          </FormField>
          <FormField label="Invoice number" required error={errors.invoiceNumber?.message}>
            <Input {...form.register('invoiceNumber')} />
          </FormField>
          <FormField label="Issue date" required error={errors.issueDate?.message}>
            <Input type="date" {...form.register('issueDate')} />
          </FormField>
          <FormField label="Due date" required error={errors.dueDate?.message}>
            <Input type="date" {...form.register('dueDate')} />
          </FormField>
          <FormField label="Currency">
            <Select {...form.register('currency')}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </Select>
          </FormField>
        </div>

        <div className="rounded-md border border-border bg-surface">
          <Table size="dense" containerClassName="rounded-md">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '34%' }}>Product</TableHead>
                <TableHead style={{ width: '12%' }} className="text-right">
                  Qty
                </TableHead>
                <TableHead style={{ width: '18%' }} className="text-right">
                  Unit price
                </TableHead>
                <TableHead style={{ width: '14%' }} className="text-right">
                  Tax %
                </TableHead>
                <TableHead style={{ width: '18%' }} className="text-right">
                  Line total
                </TableHead>
                <TableHead style={{ width: '4%' }}>
                  <span className="sr-only">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={<ShoppingCart className="h-5 w-5" />}
                      title="No lines yet"
                      description="Add at least one line item to send this invoice."
                      action={
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          leftIcon={<Plus className="h-3.5 w-3.5" />}
                          onClick={() => append({ sku: '', qty: 1, unitPrice: 0, taxRatePct: 7 })}
                        >
                          Add first line
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((row, i) => {
                  const lineErrors = errors.lines?.[i];
                  return (
                    <TableRow key={row.id} className="align-top">
                      <TableCell>
                        <Controller
                          control={form.control}
                          name={`lines.${i}.sku`}
                          render={({ field }) => (
                            <Combobox<Product>
                              items={PRODUCTS}
                              getItemLabel={(p) => `${p.name} · ${p.sku}`}
                              getItemValue={(p) => p.sku}
                              value={field.value}
                              onValueChange={(v) => {
                                const sku = typeof v === 'string' ? v : (v[0] ?? '');
                                field.onChange(sku);
                                const product = getProductBySku(sku);
                                if (product !== undefined) {
                                  form.setValue(`lines.${i}.unitPrice`, product.unitPrice);
                                  form.setValue(`lines.${i}.taxRatePct`, product.taxRatePct);
                                }
                              }}
                            >
                              <ComboboxTrigger placeholder="Pick a product…" />
                              <ComboboxContent>
                                {PRODUCTS.map((p, idx) => (
                                  <ComboboxItem
                                    key={p.sku}
                                    index={idx}
                                    comboItem={{ kind: 'item', item: p }}
                                  />
                                ))}
                              </ComboboxContent>
                            </Combobox>
                          )}
                        />
                        {lineErrors?.sku?.message !== undefined ? (
                          <p className="mt-1 text-xs text-danger">{lineErrors.sku.message}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Controller
                          control={form.control}
                          name={`lines.${i}.qty`}
                          render={({ field }) => (
                            <NumberInput
                              min={1}
                              max={999}
                              step={1}
                              precision={0}
                              value={field.value}
                              onValueChange={(v) => field.onChange(v ?? 0)}
                              aria-label={`Line ${i + 1} quantity`}
                            />
                          )}
                        />
                        {lineErrors?.qty?.message !== undefined ? (
                          <p className="mt-1 text-xs text-danger">{lineErrors.qty.message}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Controller
                          control={form.control}
                          name={`lines.${i}.unitPrice`}
                          render={({ field }) => (
                            <NumberInput
                              min={0}
                              step={0.01}
                              precision={2}
                              value={field.value}
                              onValueChange={(v) => field.onChange(v ?? 0)}
                              aria-label={`Line ${i + 1} unit price`}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Controller
                          control={form.control}
                          name={`lines.${i}.taxRatePct`}
                          render={({ field }) => (
                            <Select
                              selectSize="sm"
                              value={String(field.value)}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              aria-label={`Line ${i + 1} tax rate`}
                            >
                              {TAX_RATES.map((r) => (
                                <option key={r.rate} value={r.rate}>
                                  {r.label}
                                </option>
                              ))}
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <LineTotal index={i} />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove line ${i + 1}`}
                          onClick={() => remove(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {fields.length > 0 ? (
              <TableFooter>
                <Totals />
              </TableFooter>
            ) : null}
          </Table>
        </div>

        {errors.lines?.message !== undefined ? (
          <p className="text-xs text-danger" role="alert">
            {errors.lines.message}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => append({ sku: '', qty: 1, unitPrice: 0, taxRatePct: 7 })}
          >
            Add line
          </Button>
          <div className="flex items-center gap-2">
            {submitted ? (
              <span className="text-xs text-success-foreground">Invoice queued.</span>
            ) : null}
            <Button type="submit" variant="primary">
              Send invoice
            </Button>
          </div>
        </div>
      </Form>

      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
