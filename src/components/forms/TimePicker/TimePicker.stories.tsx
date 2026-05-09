import { useState } from 'react';
import { TimePicker } from './TimePicker';
import { FormField } from '@/components/forms/FormField';

export default { title: 'Forms/TimePicker', component: TimePicker };

export const TwentyFourHour = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<string | null>('09:30');
      return (
        <div className="max-w-sm">
          <FormField label="Time (24h)">
            <TimePicker value={v} onChange={(n) => setV(typeof n === 'string' ? n : null)} />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const TwelveHour = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<string | null>('14:30');
      return (
        <div className="max-w-sm">
          <FormField label="Time (12h)">
            <TimePicker
              format="12h"
              value={v}
              onChange={(n) => setV(typeof n === 'string' ? n : null)}
            />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithSeconds = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<string | null>('10:15:30');
      return (
        <div className="max-w-sm">
          <FormField label="Time (with seconds)">
            <TimePicker
              withSeconds
              value={v}
              onChange={(n) => setV(typeof n === 'string' ? n : null)}
            />
          </FormField>
        </div>
      );
    }
    return <Demo />;
  },
};

export const FifteenMinuteStep = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<string | null>('09:00');
      return (
        <div className="max-w-sm">
          <FormField label="Time" description="Quarter-hour increments only.">
            <TimePicker
              step={15}
              value={v}
              onChange={(n) => setV(typeof n === 'string' ? n : null)}
            />
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
      const [v, setV] = useState<string | null>('10:00');
      return (
        <div className="max-w-sm">
          <FormField label="Office hours" description="09:00–17:30 only.">
            <TimePicker
              minTime="09:00"
              maxTime="17:30"
              value={v}
              onChange={(n) => setV(typeof n === 'string' ? n : null)}
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
      <FormField label="Time" error="Required">
        <TimePicker error placeholder="Pick a time" />
      </FormField>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="max-w-sm">
      <FormField label="Time">
        <TimePicker disabled defaultValue="10:00" />
      </FormField>
    </div>
  ),
};
