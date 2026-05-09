import { type Ref } from 'react';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/cn';
import { DatePicker } from '@/components/forms/DatePicker';
import { TimePicker, type TimeFormat } from '@/components/forms/TimePicker';
import { useControllableState } from '@/hooks/useControllableState';
import type { WeekStartsOn } from '@/lib/date';

/*
 * Thin convenience composing DatePicker + TimePicker. Internal state is a
 * single `Date | null`. Selecting a date keeps the existing time portion
 * (defaulting to 00:00); selecting a time keeps the existing date portion
 * (defaulting to today). Either sub-picker emitting null clears the whole
 * value — the date and time are intentionally coupled here.
 */

export interface DateTimePickerProps {
  ref?: Ref<HTMLDivElement>;
  value?: Date | null | undefined;
  defaultValue?: Date | null | undefined;
  onChange?: ((next: Date | null) => void) | undefined;

  // Date pass-through
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  isDateDisabled?: ((d: Date) => boolean) | undefined;
  weekStartsOn?: WeekStartsOn;
  locale?: Locale | undefined;
  dateFormat?: string;
  datePlaceholder?: string;

  // Time pass-through
  timeFormat?: TimeFormat;
  step?: number;
  withSeconds?: boolean;
  timePlaceholder?: string;

  // Shared
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
}

export function DateTimePicker({
  ref,
  value: valueProp,
  defaultValue = null,
  onChange,
  minDate,
  maxDate,
  isDateDisabled,
  weekStartsOn,
  locale,
  dateFormat,
  datePlaceholder,
  timeFormat,
  step,
  withSeconds = false,
  timePlaceholder,
  disabled = false,
  error = false,
  className,
  id,
}: DateTimePickerProps) {
  const [valueRaw, setValue] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const value: Date | null = valueRaw ?? null;

  const handleDateChange = (next: Date | null) => {
    if (next === null) {
      setValue(null);
      return;
    }
    const merged = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    if (value !== null) {
      merged.setHours(value.getHours(), value.getMinutes(), value.getSeconds(), 0);
    }
    setValue(merged);
  };

  const handleTimeChange = (next: Date | string | null) => {
    if (next === null) {
      setValue(null);
      return;
    }
    let h = 0;
    let m = 0;
    let s = 0;
    if (next instanceof Date) {
      h = next.getHours();
      m = next.getMinutes();
      s = next.getSeconds();
    } else {
      const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(next.trim());
      if (match === null) return;
      h = Number(match[1]);
      m = Number(match[2]);
      s = match[3] !== undefined ? Number(match[3]) : 0;
    }
    const base =
      value !== null
        ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
        : new Date();
    base.setHours(h, m, s, 0);
    setValue(base);
  };

  return (
    <div
      ref={ref}
      data-component="datetimepicker"
      className={cn('flex w-full items-start gap-2', className)}
    >
      <div className="flex-1">
        <DatePicker
          value={value}
          onChange={handleDateChange}
          disabled={disabled}
          error={error}
          {...(id !== undefined ? { id: `${id}-date` } : {})}
          {...(minDate !== undefined ? { minDate } : {})}
          {...(maxDate !== undefined ? { maxDate } : {})}
          {...(isDateDisabled !== undefined ? { isDateDisabled } : {})}
          {...(weekStartsOn !== undefined ? { weekStartsOn } : {})}
          {...(locale !== undefined ? { locale } : {})}
          {...(dateFormat !== undefined ? { format: dateFormat } : {})}
          {...(datePlaceholder !== undefined ? { placeholder: datePlaceholder } : {})}
        />
      </div>
      <div className="flex-1">
        <TimePicker
          value={value}
          onChange={handleTimeChange}
          disabled={disabled}
          error={error}
          withSeconds={withSeconds}
          {...(id !== undefined ? { id: `${id}-time` } : {})}
          {...(timeFormat !== undefined ? { format: timeFormat } : {})}
          {...(step !== undefined ? { step } : {})}
          {...(timePlaceholder !== undefined ? { placeholder: timePlaceholder } : {})}
        />
      </div>
    </div>
  );
}
