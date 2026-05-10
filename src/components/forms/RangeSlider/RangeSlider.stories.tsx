import { useState } from 'react';
import { RangeSlider, type RangeSliderValue } from './RangeSlider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';

export default { title: 'Forms/RangeSlider', component: RangeSlider };

export const Basic = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<RangeSliderValue>([20, 80]);
      return (
        <div className="w-80 space-y-4">
          <RangeSlider
            value={v}
            onValueChange={setV}
            thumbAriaLabels={['Min', 'Max']}
            aria-label="Range"
          />
          <p className="text-sm text-foreground-muted">
            [{v[0]}, {v[1]}]
          </p>
        </div>
      );
    }
    return <Demo />;
  },
};

export const PriceRange = {
  render: () => {
    function Demo() {
      const [v, setV] = useState<RangeSliderValue>([100, 600]);
      const fmt = (n: number) => `$${n.toLocaleString()}`;
      return (
        <Card variant="outlined" className="max-w-md">
          <CardHeader>
            <CardTitle>Price range</CardTitle>
          </CardHeader>
          <CardContent>
            <RangeSlider
              min={0}
              max={1000}
              step={10}
              value={v}
              onValueChange={setV}
              minDistance={50}
              formatValue={fmt}
              thumbAriaLabels={['Min price', 'Max price']}
              aria-label="Price range"
            />
            <div className="mt-3 flex items-center justify-between text-sm text-foreground-muted">
              <span>{fmt(v[0])}</span>
              <span>{fmt(v[1])}</span>
            </div>
          </CardContent>
        </Card>
      );
    }
    return <Demo />;
  },
};

export const WithMarks = {
  render: () => (
    <div className="w-80">
      <RangeSlider
        min={0}
        max={100}
        step={25}
        defaultValue={[25, 75]}
        marks={[
          { value: 0, label: '0' },
          { value: 25, label: '25' },
          { value: 50, label: '50' },
          { value: 75, label: '75' },
          { value: 100, label: '100' },
        ]}
        thumbAriaLabels={['Min', 'Max']}
        aria-label="With marks"
      />
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div className="h-64">
      <RangeSlider
        defaultValue={[30, 70]}
        orientation="vertical"
        thumbAriaLabels={['Lo', 'Hi']}
        aria-label="Vertical range"
      />
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="w-72">
      <RangeSlider
        defaultValue={[20, 80]}
        disabled
        thumbAriaLabels={['Min', 'Max']}
        aria-label="Disabled"
      />
    </div>
  ),
};

export const FineSteps = {
  render: () => (
    <div className="w-80">
      <RangeSlider
        min={0}
        max={1}
        step={0.05}
        defaultValue={[0.2, 0.6]}
        formatValue={(v) => v.toFixed(2)}
        thumbAriaLabels={['Lo', 'Hi']}
        aria-label="Fine"
      />
    </div>
  ),
};
