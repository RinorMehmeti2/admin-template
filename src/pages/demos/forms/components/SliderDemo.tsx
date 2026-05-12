import { useState } from 'react';
import { FormField, RangeSlider, type RangeSliderValue, Slider } from '@/components/forms';

export function SliderDemo() {
  const [volume, setVolume] = useState(40);
  const [opacity, setOpacity] = useState(75);
  const [budget, setBudget] = useState<RangeSliderValue>([200, 1500]);

  return (
    <div className="space-y-8">
      <FormField label="Volume" description={`Currently ${volume}%`}>
        <Slider
          aria-label="Volume"
          value={volume}
          onValueChange={setVolume}
          formatValue={(v) => `${v}%`}
        />
      </FormField>

      <FormField label="Opacity" description="With marks">
        <Slider
          aria-label="Opacity"
          value={opacity}
          onValueChange={setOpacity}
          step={25}
          marks={[
            { value: 0, label: '0%' },
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: '100%' },
          ]}
          formatValue={(v) => `${v}%`}
        />
      </FormField>

      <FormField
        label="Budget range"
        description={`$${budget[0].toLocaleString()} – $${budget[1].toLocaleString()}`}
      >
        <RangeSlider
          aria-label="Budget range"
          thumbAriaLabels={['Min budget', 'Max budget']}
          min={0}
          max={5000}
          step={50}
          minDistance={100}
          value={budget}
          onValueChange={setBudget}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
      </FormField>
    </div>
  );
}
