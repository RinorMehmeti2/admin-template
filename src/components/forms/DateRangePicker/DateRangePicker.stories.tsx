import { useState } from 'react';
import { DateRangePicker, type DateRange } from './DateRangePicker';
import { FormField } from '@/components/forms/FormField';
import { addDays } from '@/lib/date';

export default { title: 'Forms/DateRangePicker', component: DateRangePicker };

const today = new Date();

export const Basic = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<DateRange>({ from: null, to: null });
      return (
        <div className="max-w-2xl">
          <FormField label="Date range" description="Pick a from / to.">
            <DateRangePicker value={v} onChange={setV} />
          </FormField>
          <pre className="mt-4 rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
            {JSON.stringify(
              {
                from: v.from?.toISOString().slice(0, 10) ?? null,
                to: v.to?.toISOString().slice(0, 10) ?? null,
              },
              null,
              2,
            )}
          </pre>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithCustomPresets = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<DateRange>({ from: null, to: null });
      const presets = [
        { label: 'Next 7 days', getRange: () => ({ from: today, to: addDays(today, 6) }) },
        { label: 'Next 30 days', getRange: () => ({ from: today, to: addDays(today, 29) }) },
        {
          label: 'Q1 2026',
          getRange: () => ({ from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) }),
        },
      ];
      return (
        <div className="max-w-2xl">
          <FormField label="Date range" description="With custom presets.">
            <DateRangePicker value={v} onChange={setV} presets={presets} />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const NoPresets = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<DateRange>({ from: null, to: null });
      return (
        <div className="max-w-2xl">
          <FormField label="Date range">
            <DateRangePicker value={v} onChange={setV} hidePresets />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithBounds = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<DateRange>({ from: null, to: null });
      return (
        <div className="max-w-2xl">
          <FormField label="Within next 60 days">
            <DateRangePicker
              value={v}
              onChange={setV}
              minDate={today}
              maxDate={addDays(today, 60)}
            />
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
      <FormField label="Date range" error="Please pick a range.">
        <DateRangePicker error />
      </FormField>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="max-w-2xl">
      <FormField label="Date range">
        <DateRangePicker disabled defaultValue={{ from: today, to: addDays(today, 5) }} />
      </FormField>
    </div>
  ),
};
