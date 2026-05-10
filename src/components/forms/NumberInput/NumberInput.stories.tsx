import { useState } from 'react';
import { NumberInput } from './NumberInput';
import { FormField } from '@/components/forms/FormField';

export default { title: 'Forms/NumberInput', component: NumberInput };

function BasicDemo() {
  const [v, setV] = useState<number | null>(0);
  return (
    <div className="max-w-sm">
      <NumberInput aria-label="basic" value={v} onValueChange={setV} />
    </div>
  );
}
export const Basic = { render: () => <BasicDemo /> };

function CurrencyUSDDemo() {
  const [v, setV] = useState<number | null>(1299.5);
  return (
    <div className="max-w-sm">
      <FormField label="Price (USD)">
        <NumberInput
          locale="en-US"
          formatOptions={{ style: 'currency', currency: 'USD' }}
          precision={2}
          step={0.01}
          value={v}
          onValueChange={setV}
        />
      </FormField>
    </div>
  );
}
export const CurrencyUSD = { render: () => <CurrencyUSDDemo /> };

function CurrencyEURDemo() {
  const [v, setV] = useState<number | null>(1299.5);
  return (
    <div className="max-w-sm">
      <FormField label="Precio (EUR)">
        <NumberInput
          locale="es-ES"
          formatOptions={{ style: 'currency', currency: 'EUR' }}
          precision={2}
          step={0.01}
          value={v}
          onValueChange={setV}
        />
      </FormField>
    </div>
  );
}
export const CurrencyEUR = { render: () => <CurrencyEURDemo /> };

function PercentageDemo() {
  const [v, setV] = useState<number | null>(0.4);
  return (
    <div className="max-w-sm">
      <FormField label="Completion" description="Step 1% — backed by 0.01.">
        <NumberInput
          aria-label="completion"
          formatOptions={{ style: 'percent' }}
          precision={0}
          step={0.01}
          min={0}
          max={1}
          value={v}
          onValueChange={setV}
        />
      </FormField>
    </div>
  );
}
export const Percentage = { render: () => <PercentageDemo /> };

function WithMinMaxDemo() {
  const [v, setV] = useState<number | null>(5);
  return (
    <div className="max-w-sm">
      <FormField label="Rating (0–10)">
        <NumberInput min={0} max={10} step={1} value={v} onValueChange={setV} />
      </FormField>
    </div>
  );
}
export const WithMinMax = { render: () => <WithMinMaxDemo /> };

function Precision2Demo() {
  const [v, setV] = useState<number | null>(3.14);
  return (
    <div className="max-w-sm">
      <FormField label="Rate (2 decimals)">
        <NumberInput precision={2} step={0.01} value={v} onValueChange={setV} />
      </FormField>
    </div>
  );
}
export const Precision2 = { render: () => <Precision2Demo /> };

export const Sizes = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <NumberInput aria-label="sm" inputSize="sm" defaultValue={1} />
      <NumberInput aria-label="md" inputSize="md" defaultValue={1} />
      <NumberInput aria-label="lg" inputSize="lg" defaultValue={1} />
    </div>
  ),
};

export const States = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <NumberInput aria-label="disabled" disabled defaultValue={42} />
      <NumberInput aria-label="readonly" readOnly defaultValue={42} />
      <NumberInput aria-label="error" variant="error" defaultValue={42} />
    </div>
  ),
};

export const WithAffixes = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <NumberInput
        aria-label="usd-affix"
        prefix="$"
        suffix="USD"
        defaultValue={1234.5}
        precision={2}
        step={0.01}
      />
    </div>
  ),
};
