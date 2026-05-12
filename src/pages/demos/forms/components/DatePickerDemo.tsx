import { useState } from 'react';
import { DatePicker, DateRangePicker, type DateRange, FormField } from '@/components/forms';
import { addDays } from '@/lib/date';

export function DatePickerDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const [typedDate, setTypedDate] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Date" description="Click to open the calendar.">
          <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
        </FormField>

        <FormField label="Date — typeable" description="allowTextInput, format YYYY-MM-DD.">
          <DatePicker
            value={typedDate}
            onChange={setTypedDate}
            allowTextInput
            format="yyyy-MM-dd"
            placeholder="2026-05-09"
          />
        </FormField>
      </div>

      <FormField label="Within next 30 days" description="With min/max bounds + weekend disabled.">
        <DatePicker
          minDate={today}
          maxDate={addDays(today, 30)}
          isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
          placeholder="Pick a weekday"
        />
      </FormField>

      <FormField label="Date range" description="Two months + presets.">
        <DateRangePicker value={range} onChange={setRange} />
      </FormField>
    </div>
  );
}
