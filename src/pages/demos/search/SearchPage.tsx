import { useMemo, useState } from 'react';
import { type ActiveFilter } from '@/components/data-display';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { LogsCard, SearchHeader } from './components';
import { LOGS, applyFilters } from './data';

/*
 * /search — demo for FilterableSearch. Searches across a static set of mock
 * log entries by message text, level, service, and creation date range.
 */

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 200);
  const [active, setActive] = useState<ReadonlyArray<ActiveFilter>>([]);

  const results = useMemo(() => applyFilters(LOGS, debounced, active), [debounced, active]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SearchHeader />
      <LogsCard
        query={query}
        onQueryChange={setQuery}
        active={active}
        onActiveChange={setActive}
        results={results}
      />
    </div>
  );
}
