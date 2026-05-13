import { useTranslation } from 'react-i18next';
import { Controller, useForm } from '@/components/forms/Form';
import { Form } from '@/components/forms/Form';
import { Slider } from '@/components/forms/Slider';
import { RangeSlider } from '@/components/forms/RangeSlider';
import { Rating } from '@/components/forms/Rating';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { FormField } from '@/components/forms/FormField';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface RangeValues {
  volume: number;
  priceRange: { from: number; to: number };
  rating: number;
  color: string;
}

export function RangesSection() {
  const { t } = useTranslation();
  const form = useForm<RangeValues>({
    defaultValues: {
      volume: 60,
      priceRange: { from: 20, to: 120 },
      rating: 4,
      color: '#3b82f6',
    },
  });

  return (
    <Section
      id="ranges"
      title={t('forms.fields.ranges.title')}
      description={t('forms.fields.ranges.description')}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-5">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label={`Volume · ${form.watch('volume')}`}
            description="Slider · 0–100, step 1."
          >
            <Controller
              control={form.control}
              name="volume"
              render={({ field }) => (
                <Slider
                  value={field.value}
                  onValueChange={field.onChange}
                  min={0}
                  max={100}
                  step={1}
                  aria-label="Volume"
                />
              )}
            />
          </FormField>

          <FormField
            label={`Price · ${form.watch('priceRange.from')} – ${form.watch('priceRange.to')}`}
            description="RangeSlider · two-thumb range."
          >
            <Controller
              control={form.control}
              name="priceRange"
              render={({ field }) => (
                <RangeSlider
                  value={[field.value.from, field.value.to]}
                  onValueChange={([from, to]) => field.onChange({ from, to })}
                  min={0}
                  max={500}
                  step={5}
                  aria-label="Price range"
                />
              )}
            />
          </FormField>

          <FormField label="Rating" description="Rating · 1–5 stars, keyboard arrows.">
            <Controller
              control={form.control}
              name="rating"
              render={({ field }) => (
                <Rating value={field.value} onValueChange={field.onChange} max={5} />
              )}
            />
          </FormField>

          <FormField label="Brand color" description="ColorPicker · HSL canvas + hex input.">
            <Controller
              control={form.control}
              name="color"
              render={({ field }) => (
                <ColorPicker value={field.value} onValueChange={field.onChange} />
              )}
            />
          </FormField>
        </div>
      </Form>

      <PreviewPanel form={form} />
    </Section>
  );
}
