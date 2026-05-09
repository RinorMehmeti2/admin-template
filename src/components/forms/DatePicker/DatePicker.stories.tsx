import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { FormField } from '@/components/forms/FormField';
import { addDays } from '@/lib/date';

export default { title: 'Forms/DatePicker', component: DatePicker };

const today = new Date();

export const Basic = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <div className="max-w-sm">
          <FormField label="Date" description="Pick a date.">
            <DatePicker value={value} onChange={setValue} placeholder="Pick a date" />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithMinMax = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <div className="max-w-sm">
          <FormField label="Within next two weeks" description="Range constrained.">
            <DatePicker
              value={value}
              onChange={setValue}
              minDate={today}
              maxDate={addDays(today, 14)}
              placeholder="Pick a date"
            />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const NoWeekends = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <div className="max-w-sm">
          <FormField label="Weekday only">
            <DatePicker
              value={value}
              onChange={setValue}
              isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
              placeholder="Pick a weekday"
            />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const TextInput = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <div className="max-w-sm">
          <FormField label="Type or pick" description="Format YYYY-MM-DD.">
            <DatePicker
              value={value}
              onChange={setValue}
              allowTextInput
              format="yyyy-MM-dd"
              placeholder="2026-05-09"
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
    <div className="max-w-sm">
      <FormField label="Date" error="This field is required.">
        <DatePicker error placeholder="Pick a date" />
      </FormField>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="max-w-sm">
      <FormField label="Date">
        <DatePicker disabled placeholder="Pick a date" defaultValue={today} />
      </FormField>
    </div>
  ),
};
