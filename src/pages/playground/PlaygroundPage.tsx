import { createElement, useMemo, useState } from 'react';
import { Check, Copy, RefreshCw, Search } from 'lucide-react';
import { SplitLayout } from '@/components/layout/SplitLayout';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Kbd } from '@/components/primitives/Kbd';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';
import { PLAYGROUND_REGISTRY } from '@/playground/registry';
import { PropControls } from '@/playground/PropControls';
import { generateCode } from '@/playground/codegen';
import { defaultValuesFor, resolvePreviewProps } from '@/playground/preview';
import type { PlaygroundEntry, PropValues } from '@/playground/types';

type Category = PlaygroundEntry['category'];

const CATEGORY_ORDER: ReadonlyArray<Category> = [
  'primitives',
  'forms',
  'feedback',
  'navigation',
  'data-display',
  'layout',
  'overlays',
];

const CATEGORY_LABELS: Record<Category, string> = {
  primitives: 'Primitives',
  forms: 'Forms',
  feedback: 'Feedback',
  navigation: 'Navigation',
  'data-display': 'Data display',
  layout: 'Layout',
  overlays: 'Overlays',
};

function entryKey(entry: PlaygroundEntry): string {
  return `${entry.category}:${entry.name}`;
}

interface ComponentListProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedKey: string;
  onSelect: (entry: PlaygroundEntry) => void;
}

function ComponentList({ query, onQueryChange, selectedKey, onSelect }: ComponentListProps) {
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCat = new Map<Category, PlaygroundEntry[]>();
    for (const entry of PLAYGROUND_REGISTRY) {
      const haystack = [entry.name.toLowerCase(), ...(entry.keywords ?? [])].join(' ');
      if (q !== '' && !haystack.includes(q)) continue;
      const list = byCat.get(entry.category) ?? [];
      list.push(entry);
      byCat.set(entry.category, list);
    }
    return CATEGORY_ORDER.flatMap((cat) => {
      const list = byCat.get(cat);
      if (list === undefined || list.length === 0) return [];
      return [{ cat, items: list }];
    });
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <Input
          type="search"
          placeholder="Search components…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-foreground-subtle" />}
          aria-label="Search components"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {grouped.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-foreground-subtle">
            No matches for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          grouped.map(({ cat, items }) => (
            <div key={cat} className="mb-3">
              <h3 className="px-2 pb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-foreground-subtle">
                {CATEGORY_LABELS[cat]}
                <span className="ml-1.5 font-normal text-foreground-subtle">({items.length})</span>
              </h3>
              <ul className="space-y-0.5">
                {items.map((entry) => {
                  const k = entryKey(entry);
                  const active = k === selectedKey;
                  return (
                    <li key={k}>
                      <button
                        type="button"
                        onClick={() => onSelect(entry)}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          active
                            ? 'bg-surface-muted font-medium text-foreground'
                            : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
                        )}
                      >
                        {entry.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface CodeBlockProps {
  code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const onCopy = () => {
    if (typeof navigator === 'undefined' || navigator.clipboard === undefined) {
      toast.error('Clipboard unavailable');
      return;
    }
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        toast.error('Copy failed');
      });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted/40 px-3 py-1.5">
        <span className="text-xs font-medium text-foreground-muted">JSX</span>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />
          }
          onClick={onCopy}
        >
          {copied ? 'Copied' : 'Copy code'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface PreviewProps {
  entry: PlaygroundEntry;
  values: PropValues;
  remountToken: number;
}

function Preview({ entry, values, remountToken }: PreviewProps) {
  const { props, childrenNode } = resolvePreviewProps(entry, values);
  return (
    <div className="flex min-h-[12rem] items-center justify-center rounded-lg border border-dashed border-border bg-background p-8">
      {createElement(
        entry.component,
        { key: `${entry.name}:${remountToken}`, ...props },
        childrenNode,
      )}
    </div>
  );
}

export function PlaygroundPage() {
  const [selected, setSelected] = useState<PlaygroundEntry>(PLAYGROUND_REGISTRY[0]!);
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<PropValues>(() => defaultValuesFor(PLAYGROUND_REGISTRY[0]!));
  const [remountToken, setRemountToken] = useState(0);

  const selectEntry = (entry: PlaygroundEntry) => {
    setSelected(entry);
    setValues(defaultValuesFor(entry));
    setRemountToken((n) => n + 1);
  };

  const onReset = () => {
    setValues(defaultValuesFor(selected));
    setRemountToken((n) => n + 1);
  };

  const code = useMemo(() => generateCode(selected, values), [selected, values]);

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[40rem] flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Playground</h1>
          <p className="text-sm text-foreground-muted">
            Tweak any component&rsquo;s props live. Verify in light/dark and across locales without
            rebuilding stories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            {PLAYGROUND_REGISTRY.length} components
          </Badge>
          <Kbd>?</Kbd>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-surface">
        <SplitLayout
          defaultLeftWidth={260}
          minLeftWidth={200}
          maxLeftWidth={360}
          persistKey="playground-split"
          left={
            <ComponentList
              query={query}
              onQueryChange={setQuery}
              selectedKey={entryKey(selected)}
              onSelect={selectEntry}
            />
          }
          right={
            <div className="grid h-full grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selected.name}</h2>
                    <p className="text-xs text-foreground-subtle">
                      {CATEGORY_LABELS[selected.category]}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    onClick={() => setRemountToken((n) => n + 1)}
                  >
                    Remount
                  </Button>
                </div>
                <Preview entry={selected} values={values} remountToken={remountToken} />
                <CodeBlock code={code} />
              </div>
              <aside className="rounded-lg border border-border bg-background p-4">
                <PropControls
                  entry={selected}
                  values={values}
                  onChange={setValues}
                  onReset={onReset}
                />
              </aside>
            </div>
          }
        />
      </div>
    </div>
  );
}
