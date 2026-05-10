import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';

export default { title: 'Forms/RichTextEditor', component: RichTextEditor };

const SAMPLE = `
<h2>Release notes</h2>
<p>The <strong>RichTextEditor</strong> ships with the usual suspects: <em>bold</em>, <u>underline</u>, <s>strike</s>, and <code>inline code</code>.</p>
<ul>
  <li>Bullet lists</li>
  <li>Ordered lists</li>
</ul>
<blockquote>Blockquotes pick up the muted token automatically.</blockquote>
<p>Links work too — <a href="https://example.com">example.com</a>.</p>
`;

export const Empty = {
  render: () => (
    <div className="max-w-2xl">
      <RichTextEditor placeholder="Write something interesting…" />
    </div>
  ),
};

export const WithContent = {
  render: () => {
    function Demo() {
      const [html, setHtml] = useState<string>(SAMPLE);
      return (
        <div className="max-w-2xl space-y-3">
          <RichTextEditor value={html} onChange={setHtml} />
          <details className="rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
            <summary className="cursor-pointer font-medium text-foreground">
              Output HTML
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-all">{html}</pre>
          </details>
        </div>
      );
    }
    return <Demo />;
  },
};

export const CustomToolbar = {
  render: () => (
    <div className="max-w-2xl">
      <RichTextEditor
        defaultValue="<p>Only the basics here.</p>"
        toolbar={['bold', 'italic', 'underline', 'separator', 'bulletList', 'orderedList', 'separator', 'link']}
        bubbleMenu={false}
      />
    </div>
  ),
};

export const Minimal = {
  render: () => (
    <div className="max-w-2xl">
      <RichTextEditor defaultValue="<p>Minimal preset.</p>" toolbar="minimal" />
    </div>
  ),
};

export const ReadOnly = {
  render: () => (
    <div className="max-w-2xl">
      <RichTextEditor value={SAMPLE} readOnly />
    </div>
  ),
};

export const NoToolbar = {
  render: () => (
    <div className="max-w-2xl">
      <RichTextEditor defaultValue="<p>Just the canvas.</p>" toolbar={false} bubbleMenu={false} />
    </div>
  ),
};

export const ErrorState = {
  render: () => (
    <div className="max-w-2xl">
      <RichTextEditor defaultValue="<p>Required content is missing.</p>" error />
    </div>
  ),
};

/**
 * Force the dark class on this story's container so stakeholders can review the
 * dark-mode prose styles independently of the toolbar theme switch.
 */
export const DarkMode = {
  render: () => (
    <div className="dark max-w-2xl rounded-md bg-background p-6">
      <RichTextEditor defaultValue={SAMPLE} />
    </div>
  ),
};
