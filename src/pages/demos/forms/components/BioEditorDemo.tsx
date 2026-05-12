import { useState } from 'react';
import { FormField, LazyRichTextEditor } from '@/components/forms';

export function BioEditorDemo() {
  const [html, setHtml] = useState<string>(
    '<h2>About</h2><p>Software engineer with a soft spot for <strong>typed APIs</strong> and <em>well-named identifiers</em>.</p><ul><li>React + TypeScript</li><li>ProseMirror</li><li>Design systems</li></ul>',
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
      <FormField
        label="Bio"
        description="Full toolbar with bubble menu on selection. Try selecting some text."
      >
        <LazyRichTextEditor
          value={html}
          onChange={setHtml}
          placeholder="Write your bio…"
          minHeight={220}
          aria-label="Bio"
        />
      </FormField>
      <div className="space-y-2 lg:pt-7">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Output HTML
        </p>
        <pre className="max-h-[260px] overflow-auto rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
          {html}
        </pre>
      </div>
    </div>
  );
}
