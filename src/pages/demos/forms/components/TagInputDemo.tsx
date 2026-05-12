import { useState } from 'react';
import { FormField, TagInput } from '@/components/forms';

export function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(['react', 'typescript']);
  const [emails, setEmails] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>(['frontend']);

  const validateEmail = (raw: string): string | null => {
    const t = raw.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : null;
  };

  return (
    <div className="space-y-6">
      <FormField label="Tags" description="Press comma, Enter, or Tab to commit a tag.">
        <TagInput value={tags} onValueChange={setTags} placeholder="Add tag…" />
      </FormField>

      <FormField label="Recipients" description="Email validation — invalid entries shake.">
        <TagInput
          value={emails}
          onValueChange={setEmails}
          validate={validateEmail}
          placeholder="someone@example.com"
        />
      </FormField>

      <FormField label="Topics" description="With suggestions; ArrowDown to open.">
        <TagInput
          value={topics}
          onValueChange={setTopics}
          suggestions={[
            'frontend',
            'backend',
            'design',
            'docs',
            'a11y',
            'performance',
            'testing',
            'ops',
          ]}
          maxTags={5}
          placeholder="Pick a topic…"
        />
      </FormField>
    </div>
  );
}
