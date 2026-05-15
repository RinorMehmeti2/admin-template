import { useMemo, useRef, useState } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ListChecks,
  Plus,
  ReceiptText,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react';
import { z } from 'zod';
import {
  Controller,
  Form,
  useForm,
  useFormContext,
  useWatch,
  zodResolver,
} from '@/components/forms/Form';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { NumberInput } from '@/components/forms/NumberInput';
import { Select } from '@/components/forms/Select';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
} from '@/components/forms/Combobox';
import { FormWizard, FormWizardStep, type FormWizardHandle } from '@/components/forms/FormWizard';
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
import { useToast } from '@/context/ToastProvider';
import { Section } from '../../_shared/Section';
import { PRODUCTS, TAX_RATES, getProductBySku, type Product } from '../../_shared';
import { formatMoney } from '../../_shared/format';
import { useWizardLabels } from './useWizardLabels';

interface OrderItem {
  sku: string;
  qty: number;
  unitPrice: number;
  taxRatePct: number;
  notes: string;
}

interface OrderValues {
  customer: {
    name: string;
    email: string;
    company: string;
  };
  items: OrderItem[];
}

// ---------------- Items step ----------------

interface InnerItemValues {
  sku: string;
  qty: number;
  unitPrice: number;
  taxRatePct: number;
  notes: string;
}

interface ItemsStepProps {
  outer: UseFormReturn<OrderValues>;
}

function lineTotal(item: OrderItem): number {
  return item.qty * item.unitPrice * (1 + item.taxRatePct / 100);
}

function ItemsStep({ outer }: ItemsStepProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const items = useWatch({ control: outer.control, name: 'items' });
  const { remove } = useFieldArray({ control: outer.control, name: 'items' });

  // Inner sub-form is its own useForm with its own zod schema. It writes
  // to the outer wizard's `items` field via setValue/useFieldArray.append.
  // This pattern lets the row builder validate independently while the
  // wizard keeps a single source of truth for the submitted payload.
  const itemSchema = useMemo(
    () =>
      z.object({
        sku: z.string().min(1, t('forms.zod.required')),
        qty: z
          .number({ message: t('forms.zod.required') })
          .int()
          .min(1, t('forms.zod.minQty')),
        unitPrice: z
          .number({ message: t('forms.zod.required') })
          .nonnegative(t('forms.zod.nonnegative')),
        taxRatePct: z.number().min(0).max(100),
        notes: z.string(),
      }),
    [t],
  );

  const firstInputRef = useRef<HTMLDivElement>(null);
  const inner = useForm<InnerItemValues>({
    defaultValues: { sku: '', qty: 1, unitPrice: 0, taxRatePct: 7, notes: '' },
    resolver: zodResolver(itemSchema),
    mode: 'onSubmit',
  });

  const outerItemsError = outer.formState.errors.items;
  const itemsErrorMessage =
    outerItemsError !== undefined &&
    'message' in outerItemsError &&
    typeof outerItemsError.message === 'string'
      ? outerItemsError.message
      : undefined;

  function handleAdd(values: InnerItemValues) {
    const current = outer.getValues('items');
    const next: OrderItem = {
      sku: values.sku,
      qty: values.qty,
      unitPrice: values.unitPrice,
      taxRatePct: values.taxRatePct,
      notes: values.notes ?? '',
    };
    outer.setValue('items', [...current, next], {
      shouldDirty: true,
      shouldValidate: true,
    });
    inner.reset({ sku: '', qty: 1, unitPrice: 0, taxRatePct: 7, notes: '' });
    toast.success('Item added');
    // Focus first input of inner form for fast repeat entry
    requestAnimationFrame(() => {
      const root = firstInputRef.current;
      const focusable = root?.querySelector<HTMLElement>('input, button, [role="combobox"]');
      focusable?.focus();
    });
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = items.reduce((s, i) => s + (i.qty * i.unitPrice * i.taxRatePct) / 100, 0);
  const total = subtotal + tax;

  return (
    <div className="space-y-5">
      <div ref={firstInputRef} className="rounded-md border border-border bg-surface-muted/30 p-4">
        <p className="mb-3 text-sm font-semibold tracking-tight">Add an item</p>
        <Form form={inner} onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <FormField
            label="Product"
            required
            error={inner.formState.errors.sku?.message}
            className="sm:col-span-5"
          >
            <Controller
              control={inner.control}
              name="sku"
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
                      inner.setValue('unitPrice', product.unitPrice);
                      inner.setValue('taxRatePct', product.taxRatePct);
                    }
                  }}
                >
                  <ComboboxTrigger placeholder="Pick a product…" />
                  <ComboboxContent>
                    {PRODUCTS.map((p, i) => (
                      <ComboboxItem key={p.sku} index={i} comboItem={{ kind: 'item', item: p }} />
                    ))}
                  </ComboboxContent>
                </Combobox>
              )}
            />
          </FormField>
          <FormField
            label="Qty"
            required
            error={inner.formState.errors.qty?.message}
            className="sm:col-span-2"
          >
            <Controller
              control={inner.control}
              name="qty"
              render={({ field }) => (
                <NumberInput
                  min={1}
                  max={999}
                  step={1}
                  precision={0}
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? 1)}
                />
              )}
            />
          </FormField>
          <FormField
            label="Unit price"
            required
            error={inner.formState.errors.unitPrice?.message}
            className="sm:col-span-2"
          >
            <Controller
              control={inner.control}
              name="unitPrice"
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
          <FormField label="Tax" className="sm:col-span-2">
            <Controller
              control={inner.control}
              name="taxRatePct"
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {TAX_RATES.map((r) => (
                    <option key={r.rate} value={r.rate}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>
          <FormField label="Notes" className="sm:col-span-11">
            <Input {...inner.register('notes')} placeholder="Optional" />
          </FormField>
          <div className="flex items-end sm:col-span-1">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              className="w-full"
            >
              Add
            </Button>
          </div>
        </Form>
      </div>

      <div className="rounded-md border border-border bg-surface">
        <Table size="dense" containerClassName="rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Line total</TableHead>
              <TableHead>
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-foreground-muted">
                  <span className="inline-flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    No items yet — add one above to enable Next.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, i) => {
                const product = getProductBySku(item.sku);
                return (
                  <TableRow key={`${item.sku}-${i}`}>
                    <TableCell>
                      <span className="font-medium">{product?.name ?? item.sku}</span>
                      {item.notes.length > 0 ? (
                        <span className="ml-2 text-xs text-foreground-muted">· {item.notes}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(item.unitPrice, 'USD')}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.taxRatePct}%</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(lineTotal(item), 'USD')}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${product?.name ?? item.sku}`}
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
          {items.length > 0 ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Subtotal
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(subtotal, 'USD')}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Tax
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(tax, 'USD')}</TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-right text-base font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right text-base font-semibold tabular-nums">
                  {formatMoney(total, 'USD')}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>

      {itemsErrorMessage !== undefined ? (
        <p className="text-xs text-danger" role="alert">
          {itemsErrorMessage}
        </p>
      ) : null}
    </div>
  );
}

// ---------------- Review step ----------------

function ReviewStep() {
  const { getValues } = useFormContext<OrderValues>();
  const values = getValues();
  const subtotal = values.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = values.items.reduce((s, i) => s + (i.qty * i.unitPrice * i.taxRatePct) / 100, 0);
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Customer
        </p>
        <p className="mt-1 font-medium">{values.customer.name}</p>
        <p className="text-foreground-muted">{values.customer.email}</p>
        {values.customer.company.length > 0 ? (
          <p className="text-foreground-muted">{values.customer.company}</p>
        ) : null}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Items
        </p>
        <ul className="mt-1 space-y-1">
          {values.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between">
              <span>
                {item.qty} × {getProductBySku(item.sku)?.name ?? item.sku}
              </span>
              <span className="tabular-nums">{formatMoney(lineTotal(item), 'USD')}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border pt-2 text-right text-base font-semibold tabular-nums">
        Total: {formatMoney(subtotal + tax, 'USD')}
      </div>
    </div>
  );
}

// ---------------- Wizard wrapper ----------------

export function AppendToTableWizardSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(null);
  const wizardRef = useRef<FormWizardHandle<OrderValues>>(null);

  const customerSchema = useMemo(
    () =>
      z.object({
        customer: z.object({
          name: z.string().min(1, t('forms.zod.required')),
          email: z.string().min(1, t('forms.zod.required')).email(t('forms.zod.invalidEmail')),
          company: z.string().optional().default(''),
        }),
      }),
    [t],
  );

  const itemsStepSchema = useMemo(
    () =>
      z.object({
        items: z
          .array(
            z.object({
              sku: z.string().min(1),
              qty: z.number().int().min(1),
              unitPrice: z.number().nonnegative(),
              taxRatePct: z.number().min(0).max(100),
              notes: z.string(),
            }),
          )
          .min(1, t('forms.zod.atLeastOneItem')),
      }),
    [t],
  );

  const fullSchema = useMemo(
    () => customerSchema.merge(itemsStepSchema),
    [customerSchema, itemsStepSchema],
  );

  const labels = useWizardLabels('Place order');

  if (orderId !== null) {
    return (
      <Section
        id="append-table"
        title={t('forms.multiStep.appendTable.title')}
        description={t('forms.multiStep.appendTable.description')}
        code={`<div className="flex flex-col items-start gap-3 rounded-md border border-success/30 bg-success/10 p-4">
  <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
  <div>
    <p className="text-sm font-semibold">Order placed</p>
    <p className="text-xs text-foreground-muted">Order ID · {orderId}</p>
  </div>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={() => {
      setOrderId(null);
      wizardRef.current?.reset();
    }}
  >
    Start a new order
  </Button>
</div>`}
      >
        <div className="flex flex-col items-start gap-3 rounded-md border border-success/30 bg-success/10 p-4">
          <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Order placed</p>
            <p className="text-xs text-foreground-muted">Order ID · {orderId}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setOrderId(null);
              wizardRef.current?.reset();
            }}
          >
            Start a new order
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="append-table"
      title={t('forms.multiStep.appendTable.title')}
      description={t('forms.multiStep.appendTable.description')}
      code={`<FormWizard
  ref={wizardRef}
  schema={fullSchema}
  defaultValues={{
    customer: { name: '', email: '', company: '' },
    items: [],
  }}
  responsiveOrientation
  compactBelow="sm"
  showSummaryStep
  labels={labels}
  onSubmit={() => {
    const id = \`ORD-\${Date.now().toString(36).toUpperCase()}\`;
    setOrderId(id);
    toast.success('Order placed');
  }}
  summaryRender={() => <ReviewStep />}
>
  <FormWizardStep<OrderValues>
    id="customer"
    title="Customer"
    description="Who is this order for?"
    icon={<User className="h-4 w-4" />}
    schema={customerSchema}
    render={({ form }) => (
      <div className="max-w-md space-y-4">
        <FormField label="Name" required error={form.formState.errors.customer?.name?.message}>
          <Input {...form.register('customer.name')} />
        </FormField>
        <FormField label="Email" required error={form.formState.errors.customer?.email?.message}>
          <Input type="email" {...form.register('customer.email')} />
        </FormField>
        <FormField label="Company">
          <Input {...form.register('customer.company')} />
        </FormField>
      </div>
    )}
  />
  <FormWizardStep<OrderValues>
    id="items"
    title="Add items"
    description="Each Add submit appends a row below."
    icon={<ListChecks className="h-4 w-4" />}
    schema={itemsStepSchema}
    render={({ form }) => <ItemsStep outer={form} />}
  />
  <FormWizardStep<OrderValues>
    id="review"
    title="Review"
    description="Confirm before placing the order."
    icon={<ReceiptText className="h-4 w-4" />}
    render={() => <ReviewStep />}
  />
</FormWizard>`}
    >
      <FormWizard
        ref={wizardRef}
        schema={fullSchema}
        defaultValues={{
          customer: { name: '', email: '', company: '' },
          items: [],
        }}
        responsiveOrientation
        compactBelow="sm"
        showSummaryStep
        labels={labels}
        onSubmit={() => {
          const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
          setOrderId(id);
          toast.success('Order placed');
        }}
        summaryRender={() => <ReviewStep />}
      >
        <FormWizardStep<OrderValues>
          id="customer"
          title="Customer"
          description="Who is this order for?"
          icon={<User className="h-4 w-4" />}
          schema={customerSchema}
          render={({ form }) => (
            <div className="max-w-md space-y-4">
              <FormField
                label="Name"
                required
                error={form.formState.errors.customer?.name?.message}
              >
                <Input {...form.register('customer.name')} />
              </FormField>
              <FormField
                label="Email"
                required
                error={form.formState.errors.customer?.email?.message}
              >
                <Input type="email" {...form.register('customer.email')} />
              </FormField>
              <FormField label="Company">
                <Input {...form.register('customer.company')} />
              </FormField>
            </div>
          )}
        />
        <FormWizardStep<OrderValues>
          id="items"
          title="Add items"
          description="Each Add submit appends a row below."
          icon={<ListChecks className="h-4 w-4" />}
          schema={itemsStepSchema}
          render={({ form }) => <ItemsStep outer={form} />}
        />
        <FormWizardStep<OrderValues>
          id="review"
          title="Review"
          description="Confirm before placing the order."
          icon={<ReceiptText className="h-4 w-4" />}
          render={() => <ReviewStep />}
        />
      </FormWizard>
    </Section>
  );
}
