import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  FilterableSearch,
  type ActiveFilter,
  type FilterDef,
} from '@/components/data-display';
import { Badge } from '@/components/primitives/Badge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/*
 * /search — demo for FilterableSearch. Searches across a static set of mock
 * log entries by message text, level, service, and creation date range.
 */

interface LogEntry {
  id: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  tags: ReadonlyArray<string>;
  createdAt: Date;
}

const SERVICES = ['api', 'auth', 'billing', 'worker', 'web'] as const;

function makeLogs(): LogEntry[] {
  const seeds = [
    'Failed login attempt',
    'Webhook delivered',
    'Cache miss on user profile',
    'Slow database query',
    'Background job retried',
    'Permission denied on resource',
    'Invitation email queued',
    'Stripe charge succeeded',
    'Schema migration applied',
    'Rate limit exceeded',
    'Service restarted',
    'Auth token refreshed',
  ];
  const tags = ['prod', 'staging', 'canary', 'internal'];
  return Array.from({ length: 50 }).map((_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - i * 3);
    return {
      id: `log-${i}`,
      message: seeds[i % seeds.length]!,
      level: (['info', 'warn', 'error'] as const)[i % 3]!,
      service: SERVICES[i % SERVICES.length]!,
      tags: [tags[i % tags.length]!, tags[(i + 1) % tags.length]!],
      createdAt: d,
    };
  });
}

const LOGS = makeLogs();

const FILTERS: ReadonlyArray<FilterDef> = [
  {
    id: 'level',
    label: 'Level',
    type: 'select',
    options: [
      { value: 'info', label: 'Info' },
      { value: 'warn', label: 'Warn' },
      { value: 'error', label: 'Error' },
    ],
  },
  {
    id: 'service',
    label: 'Service',
    type: 'multi-select',
    options: SERVICES.map((s) => ({ value: s, label: s })),
  },
  { id: 'tag', label: 'Tag', type: 'text', placeholder: 'tag contains…' },
  { id: 'created', label: 'Created', type: 'date-range' },
];

const levelVariant: Record<LogEntry['level'], 'info' | 'warning' | 'danger'> = {
  info: 'info',
  warn: 'warning',
  error: 'danger',
};

function applyFilters(
  rows: ReadonlyArray<LogEntry>,
  q: string,
  active: ReadonlyArray<ActiveFilter>,
): LogEntry[] {
  const query = q.trim().toLowerCase();
  return rows.filter((r) => {
    if (query !== '' && !r.message.toLowerCase().includes(query)) return false;
    for (const af of active) {
      if (af.id === 'level' && typeof af.value === 'string' && af.value !== '') {
        if (r.level !== af.value) return false;
      } else if (af.id === 'service' && Array.isArray(af.value) && af.value.length > 0) {
        if (!af.value.includes(r.service)) return false;
      } else if (af.id === 'tag' && typeof af.value === 'string' && af.value !== '') {
        const needle = af.value.toLowerCase();
        if (!r.tags.some((t) => t.toLowerCase().includes(needle))) return false;
      } else if (
        af.id === 'created' &&
        af.value !== null &&
        af.value !== undefined &&
        typeof af.value === 'object' &&
        !Array.isArray(af.value)
      ) {
        const range = af.value as { from: Date | null; to: Date | null };
        if (range.from !== null && r.createdAt < range.from) return false;
        if (range.to !== null && r.createdAt > range.to) return false;
      }
    }
    return true;
  });
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 200);
  const [active, setActive] = useState<ReadonlyArray<ActiveFilter>>([]);

  const results = useMemo(() => applyFilters(LOGS, debounced, active), [debounced, active]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-foreground-muted">
          A reusable search + filter chips composition. Type to search messages, click "Filter" to
          add level / service / tag / date-range constraints.
        </p>
      </header>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>
            {results.length} of {LOGS.length} entries — query is debounced by 200ms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterableSearch
            filters={FILTERS}
            query={query}
            onQueryChange={setQuery}
            activeFilters={active}
            onActiveFiltersChange={setActive}
            placeholder="Search messages…"
          />
          {results.length === 0 ? (
            <EmptyState
              title="No logs match"
              description="Loosen the filters or clear the search."
            />
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {results.slice(0, 25).map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <Badge variant={levelVariant[r.level]} size="sm">
                    {r.level}
                  </Badge>
                  <span className="font-mono text-xs text-foreground-subtle">{r.service}</span>
                  <span className="flex-1 truncate">{r.message}</span>
                  <span className="tabular-nums text-xs text-foreground-muted">
                    {format(r.createdAt, 'MMM d, HH:mm')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
