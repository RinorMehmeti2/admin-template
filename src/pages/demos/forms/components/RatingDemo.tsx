import { useState } from 'react';
import { Heart } from 'lucide-react';
import { FormField, Rating } from '@/components/forms';

export function RatingDemo() {
  const [rating, setRating] = useState(0);
  const [survey, setSurvey] = useState(7);
  const [hearts, setHearts] = useState(2);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Rate this article" description="Half-star precision, click again to clear.">
        <Rating value={rating} onValueChange={setRating} max={5} allowHalf />
        <p className="mt-1 text-xs text-foreground-muted">value: {rating}</p>
      </FormField>

      <FormField label="NPS — 0 to 10" description="Survey scale, integer steps.">
        <Rating value={survey} onValueChange={setSurvey} max={10} size="sm" />
        <p className="mt-1 text-xs text-foreground-muted">score: {survey}</p>
      </FormField>

      <FormField label="Hearts" description="Custom icon.">
        <Rating value={hearts} onValueChange={setHearts} max={5} icon={Heart} size="lg" />
      </FormField>

      <FormField label="Average rating" description="Read-only summary.">
        <Rating value={4.5} max={5} allowHalf readOnly />
        <p className="mt-1 text-xs text-foreground-muted">4.5 / 5 (1,284 reviews)</p>
      </FormField>
    </div>
  );
}
