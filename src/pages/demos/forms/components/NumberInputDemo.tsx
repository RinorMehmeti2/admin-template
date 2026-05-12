import { useState } from 'react';
import { FormField, NumberInput } from '@/components/forms';

export function NumberInputDemo() {
  const [price, setPrice] = useState<number | null>(1299.99);
  const [eur, setEur] = useState<number | null>(1299.5);
  const [pct, setPct] = useState<number | null>(0.42);
  const [rating, setRating] = useState<number | null>(5);
  const [rate, setRate] = useState<number | null>(3.14);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Price (USD)" description="en-US, currency formatting, step 0.01.">
        <NumberInput
          locale="en-US"
          formatOptions={{ style: 'currency', currency: 'USD' }}
          precision={2}
          step={0.01}
          min={0}
          value={price}
          onValueChange={setPrice}
        />
      </FormField>

      <FormField label="Precio (EUR)" description="es-ES grouping (1.299,50 €).">
        <NumberInput
          locale="es-ES"
          formatOptions={{ style: 'currency', currency: 'EUR' }}
          precision={2}
          step={0.01}
          min={0}
          value={eur}
          onValueChange={setEur}
        />
      </FormField>

      <FormField label="Completion" description="Percent format. 0–1, step 0.01.">
        <NumberInput
          formatOptions={{ style: 'percent' }}
          precision={0}
          step={0.01}
          min={0}
          max={1}
          value={pct}
          onValueChange={setPct}
        />
      </FormField>

      <FormField label="Rating" description="0–10, integer, Home/End jump to bounds.">
        <NumberInput min={0} max={10} step={1} value={rating} onValueChange={setRating} />
      </FormField>

      <FormField label="Rate" description="Two decimals.">
        <NumberInput precision={2} step={0.01} value={rate} onValueChange={setRate} />
      </FormField>

      <FormField label="With affixes" description="Prefix/suffix slots.">
        <NumberInput prefix="$" suffix="USD" precision={2} step={0.01} defaultValue={1234.5} />
      </FormField>
    </div>
  );
}
