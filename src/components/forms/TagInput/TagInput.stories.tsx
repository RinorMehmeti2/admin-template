import { useState } from 'react';
import { TagInput } from './TagInput';
import { FormField } from '@/components/forms/FormField';

export default { title: 'Forms/TagInput', component: TagInput };

const TAG_SUGGESTIONS = [
  'frontend',
  'backend',
  'design',
  'docs',
  'a11y',
  'performance',
  'testing',
  'ops',
];

function SimpleStringTagsDemo() {
  const [v, setV] = useState<string[]>(['react', 'typescript']);
  return (
    <div className="max-w-md">
      <FormField label="Tags" description="Press comma, Enter, or Tab to commit.">
        <TagInput value={v} onValueChange={setV} placeholder="Add a tag…" />
      </FormField>
    </div>
  );
}
export const SimpleStringTags = { render: () => <SimpleStringTagsDemo /> };

function EmailTagsDemo() {
  const [v, setV] = useState<string[]>([]);
  const validate = (raw: string): string | null => {
    const trimmed = raw.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
  };
  return (
    <div className="max-w-md">
      <FormField label="To" description="Invalid emails shake briefly and don't commit.">
        <TagInput
          value={v}
          onValueChange={setV}
          validate={validate}
          placeholder="someone@example.com"
        />
      </FormField>
    </div>
  );
}
export const EmailTags = { render: () => <EmailTagsDemo /> };

function WithSuggestionsDemo() {
  const [v, setV] = useState<string[]>(['frontend']);
  return (
    <div className="max-w-md">
      <FormField label="Topics" description="Type to filter, ArrowDown to navigate, Enter to add.">
        <TagInput
          value={v}
          onValueChange={setV}
          suggestions={TAG_SUGGESTIONS}
          placeholder="Add topic…"
        />
      </FormField>
    </div>
  );
}
export const WithSuggestions = { render: () => <WithSuggestionsDemo /> };

function MaxFiveDemo() {
  const [v, setV] = useState<string[]>(['a', 'b', 'c']);
  return (
    <div className="max-w-md">
      <FormField label="Up to 5 tags" description="The 6th attempt shakes.">
        <TagInput value={v} onValueChange={setV} maxTags={5} placeholder="…" />
      </FormField>
    </div>
  );
}
export const MaxFive = { render: () => <MaxFiveDemo /> };

export const Disabled = {
  render: () => (
    <div className="max-w-md space-y-3">
      <FormField label="Disabled">
        <TagInput defaultValue={['react', 'typescript']} disabled />
      </FormField>
      <FormField label="Read-only chips">
        <TagInput defaultValue={['locked', 'final']} readOnly />
      </FormField>
    </div>
  ),
};

export const ErrorState = {
  render: () => (
    <div className="max-w-md">
      <FormField label="Tags" error="At least one tag required">
        <TagInput variant="error" defaultValue={[]} placeholder="Add tag…" />
      </FormField>
    </div>
  ),
};

interface UserTag {
  id: string;
  name: string;
}

function CustomTagTypeDemo() {
  const [v, setV] = useState<UserTag[]>([
    { id: '1', name: 'Ada' },
    { id: '2', name: 'Grace' },
  ]);
  const validate = (raw: string): UserTag | null => {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    return { id: crypto.randomUUID(), name: trimmed };
  };
  return (
    <div className="max-w-md">
      <FormField label="People" description="Generic over a custom tag type.">
        <TagInput<UserTag>
          value={v}
          onValueChange={setV}
          validate={validate}
          getTagLabel={(t) => t.name}
          getTagKey={(t) => t.id}
          placeholder="Add a name…"
        />
      </FormField>
    </div>
  );
}
export const CustomTagType = { render: () => <CustomTagTypeDemo /> };
