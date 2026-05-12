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
} from '@/components/data-display';
import { Badge } from '@/components/primitives/Badge';
import { FILTERS, LOGS, levelVariant } from '../data';
import type { LogEntry } from '../model';

interface LogsCardProps {
  query: string;
  onQueryChange: (q: string) => void;
  active: ReadonlyArray<ActiveFilter>;
  onActiveChange: (filters: ReadonlyArray<ActiveFilter>) => void;
  results: ReadonlyArray<LogEntry>;
}

export function LogsCard({
  query,
  onQueryChange,
  active,
  onActiveChange,
  results,
}: LogsCardProps) {
  return (
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
          onQueryChange={onQueryChange}
          activeFilters={active}
          onActiveFiltersChange={onActiveChange}
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
  );
}
