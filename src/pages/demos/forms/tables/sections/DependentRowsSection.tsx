import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { Controller, Form, useForm } from '@/components/forms/Form';
import { NumberInput } from '@/components/forms/NumberInput';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
} from '@/components/forms/Combobox';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Badge } from '@/components/primitives/Badge';
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
import { PRODUCTS, getProductBySku, type Product } from '../../_shared';

interface DependentValues {
  rows: Array<{
    sku: string;
    qty: number;
    parent?: string;
  }>;
}

const CODE = `// Picking a parent product appends it + its accessories (each tagged with parent SKU).
const onAddSku = (sku: string) => {
  const product = getProductBySku(sku);
  if (product === undefined) return;
  append({ sku: product.sku, qty: 1 });
  for (const accSku of product.accessories ?? []) {
    const acc = getProductBySku(accSku);
    if (acc !== undefined) append({ sku: acc.sku, qty: 1, parent: product.sku });
  }
};

<Form form={form} onSubmit={() => undefined} className="space-y-4">
  <Combobox<Product>
    items={PRODUCTS.filter((p) => p.accessories !== undefined)}
    getItemLabel={(p) => \`\${p.name} (auto-adds \${p.accessories?.length ?? 0})\`}
    getItemValue={(p) => p.sku}
    value=""
    onValueChange={(v) => onAddSku(typeof v === 'string' ? v : (v[0] ?? ''))}
  >
    <ComboboxTrigger placeholder="Pick a parent product…" />
    <ComboboxContent>{/* items */}</ComboboxContent>
  </Combobox>

  <Table size="dense">
    <TableHeader>{/* Product · Qty · Type · Remove */}</TableHeader>
    <TableBody>
      {fields.map((row, i) => {
        const isAccessory = row.parent !== undefined;
        return (
          <TableRow key={row.id}>
            <TableCell>{getProductBySku(row.sku)?.name}</TableCell>
            <TableCell>
              <Controller
                control={form.control}
                name={\`rows.\${i}.qty\`}
                render={({ field }) => (
                  <NumberInput min={1} max={99} value={field.value} onValueChange={(v) => field.onChange(v ?? 1)} />
                )}
              />
            </TableCell>
            <TableCell>
              <Badge variant={isAccessory ? 'info' : 'success'}>
                {isAccessory ? 'accessory' : 'parent'}
              </Badge>
            </TableCell>
            <TableCell>
              <IconButton onClick={() => remove(i)}><Trash2 /></IconButton>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</Form>`;

export function DependentRowsSection() {
  const { t } = useTranslation();
  const [lastAppended, setLastAppended] = useState<string | null>(null);
  const form = useForm<DependentValues>({
    defaultValues: { rows: [] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'rows' });

  const onAddSku = (sku: string) => {
    if (sku === '') return;
    const product = getProductBySku(sku);
    if (product === undefined) return;
    append({ sku: product.sku, qty: 1 });
    if (product.accessories !== undefined) {
      for (const accSku of product.accessories) {
        const acc = getProductBySku(accSku);
        if (acc !== undefined) append({ sku: acc.sku, qty: 1, parent: product.sku });
      }
    }
    setLastAppended(product.name);
  };

  return (
    <Section
      id="dependent"
      title={t('forms.tables.dependent.title')}
      description={t('forms.tables.dependent.description')}
      code={CODE}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[18rem] flex-1">
            <p className="mb-1 text-xs font-medium text-foreground-muted">Add parent product</p>
            <Controller
              control={form.control}
              name="rows"
              render={() => (
                <Combobox<Product>
                  items={PRODUCTS.filter((p) => p.accessories !== undefined)}
                  getItemLabel={(p) => `${p.name} (auto-adds ${p.accessories?.length ?? 0})`}
                  getItemValue={(p) => p.sku}
                  value=""
                  onValueChange={(v) => onAddSku(typeof v === 'string' ? v : (v[0] ?? ''))}
                >
                  <ComboboxTrigger placeholder="Pick a parent product…" />
                  <ComboboxContent>
                    {PRODUCTS.filter((p) => p.accessories !== undefined).map((p, i) => (
                      <ComboboxItem key={p.sku} index={i} comboItem={{ kind: 'item', item: p }} />
                    ))}
                  </ComboboxContent>
                </Combobox>
              )}
            />
          </div>
          {lastAppended !== null ? (
            <span className="text-xs text-success-foreground">
              Added “{lastAppended}” + accessories.
            </span>
          ) : null}
        </div>

        <div className="rounded-md border border-border bg-surface">
          <Table size="dense" containerClassName="rounded-md">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '60%' }}>Product</TableHead>
                <TableHead style={{ width: '15%' }} className="text-right">
                  Qty
                </TableHead>
                <TableHead style={{ width: '15%' }}>Type</TableHead>
                <TableHead style={{ width: '10%' }}>
                  <span className="sr-only">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-foreground-muted">
                    No products yet — add a parent above to see accessories auto-append.
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((row, i) => {
                  const product = getProductBySku(row.sku);
                  const isAccessory = row.parent !== undefined;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <span className="font-medium">{product?.name ?? row.sku}</span>
                        {isAccessory ? (
                          <span className="ml-2 text-xs text-foreground-muted">
                            ↳ for {getProductBySku(row.parent ?? '')?.name ?? row.parent}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Controller
                          control={form.control}
                          name={`rows.${i}.qty`}
                          render={({ field }) => (
                            <NumberInput
                              min={1}
                              max={99}
                              step={1}
                              precision={0}
                              value={field.value}
                              onValueChange={(v) => field.onChange(v ?? 1)}
                              aria-label={`Qty for ${product?.name ?? row.sku}`}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={isAccessory ? 'info' : 'success'} size="sm">
                          {isAccessory ? 'accessory' : 'parent'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Remove row"
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
          </Table>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => append({ sku: 'SKU-0011', qty: 1 })}
          >
            Add accessory-only row
          </Button>
          <Button type="submit" variant="primary">
            Save order
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
