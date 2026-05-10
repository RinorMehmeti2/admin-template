import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Rating } from './Rating';
import { FormField } from '@/components/forms/FormField';

export default { title: 'Forms/Rating', component: Rating };

function FiveStarDemo() {
  const [v, setV] = useState(0);
  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Rating" description="Half-star precision; ArrowLeft/Right adjust.">
        <Rating value={v} onValueChange={setV} max={5} allowHalf />
      </FormField>
      <p className="text-xs text-foreground-muted">value: {v}</p>
    </div>
  );
}
export const FiveStarHalves = { render: () => <FiveStarDemo /> };

function TenStepDemo() {
  const [v, setV] = useState(7);
  return (
    <div className="max-w-md space-y-3">
      <FormField label="How likely are you to recommend us?" description="0–10 survey scale.">
        <Rating value={v} onValueChange={setV} max={10} size="sm" />
      </FormField>
      <p className="text-xs text-foreground-muted">score: {v}</p>
    </div>
  );
}
export const TenStepSurvey = { render: () => <TenStepDemo /> };

function HeartDemo() {
  const [v, setV] = useState(2);
  return (
    <div className="max-w-sm">
      <FormField label="Favorites" description="Custom heart icon, size lg.">
        <Rating value={v} onValueChange={setV} max={5} size="lg" icon={Heart} />
      </FormField>
    </div>
  );
}
export const HeartIcon = { render: () => <HeartDemo /> };

function ReadOnlyDemo() {
  return (
    <div className="max-w-sm space-y-2">
      <FormField label="Average rating" description="Read-only summary with half-stars.">
        <Rating value={4.5} max={5} allowHalf readOnly />
      </FormField>
      <p className="text-xs text-foreground-muted">4.5 / 5 (1,284 reviews)</p>
    </div>
  );
}
export const ReadOnly = { render: () => <ReadOnlyDemo /> };

function DisabledDemo() {
  return (
    <div className="max-w-sm">
      <FormField label="Locked rating">
        <Rating defaultValue={3} disabled />
      </FormField>
    </div>
  );
}
export const Disabled = { render: () => <DisabledDemo /> };
