import { useState } from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxTrigger,
  FormField,
} from '@/components/forms';
import { COUNTRIES, TAG_SUGGESTIONS } from '../data';
import type { Country } from '../model';

export function ComboboxDemo() {
  const [country, setCountry] = useState<string | ReadonlyArray<string>>('');
  const [tags, setTags] = useState<ReadonlyArray<string>>(['frontend', 'a11y']);
  const [tagItems, setTagItems] = useState(TAG_SUGGESTIONS);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Country" description="Single-select with search.">
        <Combobox<Country>
          items={COUNTRIES}
          getItemLabel={(c) => c.name}
          getItemValue={(c) => c.code}
          value={country}
          onValueChange={setCountry}
        >
          <ComboboxTrigger placeholder="Pick a country…" />
          <ComboboxContent />
        </Combobox>
      </FormField>

      <FormField label="Tags" description="Multi-select. Type to create.">
        <Combobox<{ value: string; label: string }>
          items={tagItems}
          getItemLabel={(t) => t.label}
          getItemValue={(t) => t.value}
          multiple
          value={tags}
          onValueChange={(next) => {
            if (Array.isArray(next)) setTags(next);
          }}
          creatable
          onCreate={(name) => {
            const value = name.trim().toLowerCase().replace(/\s+/g, '-');
            if (value === '') return;
            setTagItems((cur) =>
              cur.some((t) => t.value === value) ? cur : [...cur, { value, label: name.trim() }],
            );
            setTags((cur) => (cur.includes(value) ? cur : [...cur, value]));
          }}
        >
          <ComboboxTrigger placeholder="Add tags…" />
          <ComboboxContent />
        </Combobox>
      </FormField>
    </div>
  );
}
