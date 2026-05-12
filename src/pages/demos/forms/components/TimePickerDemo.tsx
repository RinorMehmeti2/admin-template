import { useState } from 'react';
import { FormField, TimePicker } from '@/components/forms';

export function TimePickerDemo() {
  const [t24, setT24] = useState<string | null>('09:30');
  const [t12, setT12] = useState<string | null>('14:30');
  const [tStep, setTStep] = useState<string | null>('09:00');
  const [tSec, setTSec] = useState<string | null>('10:15:30');

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="24-hour" description="Default format.">
        <TimePicker value={t24} onChange={(n) => setT24(typeof n === 'string' ? n : null)} />
      </FormField>

      <FormField label="12-hour" description="With AM/PM column.">
        <TimePicker
          format="12h"
          value={t12}
          onChange={(n) => setT12(typeof n === 'string' ? n : null)}
        />
      </FormField>

      <FormField label="15-min step" description="Quarter-hour increments.">
        <TimePicker
          step={15}
          value={tStep}
          onChange={(n) => setTStep(typeof n === 'string' ? n : null)}
        />
      </FormField>

      <FormField label="With seconds" description="HH:MM:SS.">
        <TimePicker
          withSeconds
          value={tSec}
          onChange={(n) => setTSec(typeof n === 'string' ? n : null)}
        />
      </FormField>
    </div>
  );
}
