import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from '@/components/forms/Form';
import { Form } from '@/components/forms/Form';
import { Calendar } from '@/components/forms/Calendar';
import { DatePicker } from '@/components/forms/DatePicker';
import { DateRangePicker, type DateRange } from '@/components/forms/DateRangePicker';
import { DateTimePicker } from '@/components/forms/DateTimePicker';
import { TimePicker } from '@/components/forms/TimePicker';
import { FormField } from '@/components/forms/FormField';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface DateValues {
  date: Date | null;
  range: DateRange;
  dateTime: Date | null;
  time: string;
  inline: Date | undefined;
}

export function DatesSection() {
  const { t } = useTranslation();
  const [month, setMonth] = useState<Date>(new Date(2026, 5, 1));
  const form = useForm<DateValues>({
    defaultValues: {
      date: new Date(2026, 5, 14),
      range: { from: null, to: null },
      dateTime: null,
      time: '09:30',
      inline: new Date(2026, 5, 14),
    },
  });

  return (
    <Section
      id="dates"
      title={t('forms.fields.dates.title')}
      description={t('forms.fields.dates.description')}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date" description="DatePicker — click to open the calendar.">
            <Controller
              control={form.control}
              name="date"
              render={({ field }) => (
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Pick a date" />
              )}
            />
          </FormField>

          <FormField label="Date range" description="Two-month picker with presets.">
            <Controller
              control={form.control}
              name="range"
              render={({ field }) => (
                <DateRangePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Date + time" description="DateTimePicker — date then time.">
            <Controller
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <DateTimePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Time" description="TimePicker — 24h, step 15.">
            <Controller
              control={form.control}
              name="time"
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={(v) =>
                    field.onChange(typeof v === 'string' ? v : (v?.toString() ?? ''))
                  }
                  step={15}
                  format="24h"
                />
              )}
            />
          </FormField>
        </div>

        <FormField label="Inline calendar" description="Calendar rendered inline.">
          <Controller
            control={form.control}
            name="inline"
            render={({ field }) => (
              <Calendar
                month={month}
                onMonthChange={setMonth}
                value={field.value}
                onChange={(d) => field.onChange(d)}
              />
            )}
          />
        </FormField>
      </Form>

      <PreviewPanel form={form} />
    </Section>
  );
}
