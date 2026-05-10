import { useState } from 'react';
import { Slider } from './Slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';

export default { title: 'Forms/Slider', component: Slider };

export const Basic = {
  render: () => {
    function Demo() {
      const [v, setV] = useState(40);
      return (
        <div className="w-72 space-y-4">
          <Slider aria-label="Volume" value={v} onValueChange={setV} />
          <p className="text-sm text-foreground-muted">Value: {v}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithMarks = {
  render: () => (
    <div className="w-80">
      <Slider
        aria-label="Quality"
        defaultValue={50}
        min={0}
        max={100}
        step={25}
        marks={[
          { value: 0, label: 'Low' },
          { value: 25, label: 'Med' },
          { value: 50, label: 'High' },
          { value: 75, label: 'Ultra' },
          { value: 100, label: 'Max' },
        ]}
      />
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div className="h-64">
      <Slider aria-label="Brightness" defaultValue={60} orientation="vertical" />
    </div>
  ),
};

export const Inverted = {
  render: () => (
    <div className="w-72">
      <Slider aria-label="Reverse" defaultValue={30} invert />
    </div>
  ),
};

export const FormattedPercent = {
  render: () => (
    <div className="w-72">
      <Slider aria-label="Opacity" defaultValue={75} formatValue={(v) => `${v}%`} />
    </div>
  ),
};

export const FormattedCurrency = {
  render: () => (
    <Card variant="outlined" className="max-w-md">
      <CardHeader>
        <CardTitle>Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <Slider
          aria-label="Budget"
          min={0}
          max={5000}
          step={50}
          defaultValue={1500}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
      </CardContent>
    </Card>
  ),
};

export const Disabled = {
  render: () => (
    <div className="w-72">
      <Slider aria-label="Locked" defaultValue={60} disabled />
    </div>
  ),
};

export const SmallSteps = {
  render: () => (
    <div className="w-72">
      <Slider
        aria-label="Speed"
        min={0}
        max={2}
        step={0.1}
        defaultValue={1}
        formatValue={(v) => `${v.toFixed(1)}x`}
      />
    </div>
  ),
};
