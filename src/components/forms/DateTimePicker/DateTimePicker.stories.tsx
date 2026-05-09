import { useState } from 'react';
import { DateTimePicker } from './DateTimePicker';
import { FormField } from '@/components/forms/FormField';

export default { title: 'Forms/DateTimePicker', component: DateTimePicker };

export const Basic = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<Date | null>(null);
      return (
        <div className="max-w-2xl">
          <FormField label="When" description="Pick a date and time.">
            <DateTimePicker value={v} onChange={setV} />
          </FormField>
          <pre className="mt-4 rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
            {v === null ? 'null' : v.toISOString()}
          </pre>
        </div>
      );
    }
    return <Demo />;
  },
};

export const TwelveHourWithStep = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<Date | null>(null);
      return (
        <div className="max-w-2xl">
          <FormField label="When" description="12h, 15-min step.">
            <DateTimePicker value={v} onChange={setV} timeFormat="12h" step={15} />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const ErrorState = {
  render: () => (
    <div className="max-w-2xl">
      <FormField label="When" error="Pick both a date and a time.">
        <DateTimePicker error />
      </FormField>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="max-w-2xl">
      <FormField label="When">
        <DateTimePicker disabled defaultValue={new Date(2026, 4, 9, 14, 30, 0)} />
      </FormField>
    </div>
  ),
};
