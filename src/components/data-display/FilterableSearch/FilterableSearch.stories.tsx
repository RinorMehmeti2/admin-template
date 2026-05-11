import { useMemo, useState } from 'react';
import { FilterableSearch } from './FilterableSearch';
import type { ActiveFilter, FilterDef } from './FilterableSearch.types';

export default { title: 'Data Display/FilterableSearch', component: FilterableSearch };

const ALL_FILTERS: ReadonlyArray<FilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'invited', label: 'Invited' },
      { value: 'suspended', label: 'Suspended' },
    ],
  },
  {
    id: 'role',
    label: 'Role',
    type: 'multi-select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
  { id: 'email', label: 'Email', type: 'text', placeholder: 'contains…' },
  { id: 'created', label: 'Created', type: 'date-range' },
  {
    id: 'plan',
    label: 'Plan',
    type: 'select',
    options: [
      { value: 'starter', label: 'Starter' },
      { value: 'team', label: 'Team' },
      { value: 'business', label: 'Business' },
    ],
  },
  {
    id: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'beta', label: 'Beta' },
      { value: 'churn-risk', label: 'Churn risk' },
      { value: 'vip', label: 'VIP' },
    ],
  },
];

export function Default() {
  return (
    <div className="w-[640px]">
      <FilterableSearch filters={ALL_FILTERS.slice(0, 4)} placeholder="Search users…" />
    </div>
  );
}

export function WithDefaultActive() {
  return (
    <div className="w-[640px]">
      <FilterableSearch
        filters={ALL_FILTERS}
        defaultActiveFilters={[
          { id: 'status', value: 'active' },
          { id: 'role', value: ['admin', 'editor'] },
        ]}
      />
    </div>
  );
}

export function ManyActiveWraps() {
  const [active, setActive] = useState<ReadonlyArray<ActiveFilter>>([
    { id: 'status', value: 'active' },
    { id: 'role', value: ['admin', 'editor', 'viewer'] },
    { id: 'email', value: '@acme.com' },
    { id: 'plan', value: 'team' },
    { id: 'tags', value: ['vip', 'beta'] },
    { id: 'created', value: { from: new Date(2026, 0, 1), to: new Date(2026, 4, 1) } },
  ]);
  return (
    <div className="w-[640px]">
      <FilterableSearch
        filters={ALL_FILTERS}
        activeFilters={active}
        onActiveFiltersChange={setActive}
      />
    </div>
  );
}

export function NoFiltersAvailable() {
  const filters = useMemo<ReadonlyArray<FilterDef>>(
    () => [{ id: 'status', label: 'Status', type: 'select', options: [{ value: 'a', label: 'A' }] }],
    [],
  );
  return (
    <div className="w-[640px]">
      <FilterableSearch
        filters={filters}
        defaultActiveFilters={[{ id: 'status', value: 'a' }]}
      />
    </div>
  );
}

export function ControlledQuery() {
  const [q, setQ] = useState('');
  return (
    <div className="w-[640px] space-y-2">
      <FilterableSearch
        filters={ALL_FILTERS.slice(0, 4)}
        query={q}
        onQueryChange={setQ}
        onSubmit={(s) => window.alert(`submit: ${s}`)}
      />
      <p className="text-xs text-foreground-muted">query (debounced separately): {q}</p>
    </div>
  );
}
