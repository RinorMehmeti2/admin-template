import { useState } from 'react';
import { DateTimePicker, FormField } from '@/components/forms';

export function DateTimePickerDemo() {
  const [v, setV] = useState<Date | null>(null);
  return (
    <FormField label="When" description="Composed DatePicker + TimePicker.">
      <DateTimePicker value={v} onChange={setV} timeFormat="12h" step={15} />
      {v !== null ? <p className="text-xs text-foreground-muted">{v.toString()}</p> : null}
    </FormField>
  );
}
