import { useState } from 'react';
import { Calendar } from './Calendar';
import { addDays, addMonths, startOfMonth } from '@/lib/date';

export default { title: 'Forms/Calendar', component: Calendar };

const today = new Date();

export const Default = {
  render: () => {
    function Demo() {
      const [month, setMonth] = useState(startOfMonth(today));
      const [value, setValue] = useState<Date | undefined>(undefined);
      return <Calendar month={month} onMonthChange={setMonth} value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const SundayStart = {
  render: () => {
    function Demo() {
      const [month, setMonth] = useState(startOfMonth(today));
      const [value, setValue] = useState<Date | undefined>(undefined);
      return (
        <Calendar
          month={month}
          onMonthChange={setMonth}
          value={value}
          onChange={setValue}
          weekStartsOn={0}
        />
      );
    }
    return <Demo />;
  },
};

export const WithMinMax = {
  render: () => {
    function Demo() {
      const [month, setMonth] = useState(startOfMonth(today));
      const [value, setValue] = useState<Date | undefined>(undefined);
      return (
        <Calendar
          month={month}
          onMonthChange={setMonth}
          value={value}
          onChange={setValue}
          minDate={addDays(today, -3)}
          maxDate={addDays(today, 14)}
        />
      );
    }
    return <Demo />;
  },
};

export const NoWeekends = {
  render: () => {
    function Demo() {
      const [month, setMonth] = useState(startOfMonth(today));
      const [value, setValue] = useState<Date | undefined>(undefined);
      return (
        <Calendar
          month={month}
          onMonthChange={setMonth}
          value={value}
          onChange={setValue}
          isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
        />
      );
    }
    return <Demo />;
  },
};

export const WithHighlightRange = {
  render: () => {
    function Demo() {
      const [month, setMonth] = useState(startOfMonth(today));
      const range = { from: today, to: addDays(today, 5) };
      return <Calendar month={month} onMonthChange={setMonth} highlightRange={range} />;
    }
    return <Demo />;
  },
};

export const HideOutsideDays = {
  render: () => {
    function Demo() {
      const [month, setMonth] = useState(startOfMonth(today));
      return <Calendar month={month} onMonthChange={setMonth} showOutsideDays={false} />;
    }
    return <Demo />;
  },
};

export const TwoMonthsSideBySide = {
  render: () => {
    function Demo() {
      const [left, setLeft] = useState(startOfMonth(today));
      const right = addMonths(left, 1);
      return (
        <div className="flex gap-4">
          <Calendar month={left} onMonthChange={setLeft} />
          <Calendar month={right} onMonthChange={(d) => setLeft(addMonths(d, -1))} />
        </div>
      );
    }
    return <Demo />;
  },
};
