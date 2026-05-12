import { Trash2, Users as UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  DataTable,
  EmptyState,
  FilterableSearch,
  type ActiveFilter,
  type FilterDef,
} from '@/components/data-display';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Avatar } from '@/components/primitives/Avatar';
import { AvatarGroup } from '@/components/primitives/AvatarGroup';
import { Badge } from '@/components/primitives/Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import { Button } from '@/components/primitives/Button';
import { api, keys, useApiSuspenseQuery } from '@/data';
import type { User, UsersResponse } from '../model';

const userStatusVariant: Record<User['status'], 'success' | 'warning' | 'danger'> = {
  Active: 'success',
  Invited: 'warning',
  Suspended: 'danger',
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickAssignees(self: User, pool: User[]): User[] {
  if (pool.length <= 1) return [];
  const others = pool.filter((u) => u.id !== self.id);
  const count = 2 + (hashStr(self.id) % 6); // 2..7
  const start = hashStr(self.id) % others.length;
  return Array.from({ length: Math.min(count, others.length) }).map(
    (_, i) => others[(start + i) % others.length]!,
  );
}

function makeUserColumns(allUsers: User[]): ColumnDef<User, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-foreground-muted">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'role', header: 'Role' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={userStatusVariant[row.original.status]} dot size="sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'assignedTo',
      header: 'Assigned to',
      enableSorting: false,
      cell: ({ row }) => {
        const assignees = pickAssignees(row.original, allUsers);
        if (assignees.length === 0) {
          return <span className="text-xs text-foreground-muted">—</span>;
        }
        return (
          // Stop row-click bubbling so the chip/avatars don't trigger row navigation.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div onClick={(e) => e.stopPropagation()}>
            <AvatarGroup
              items={assignees.map((u) => ({ name: u.name }))}
              max={3}
              size="sm"
              aria-label={`Assigned to ${assignees.length}`}
              renderItem={(avatar, item) => (
                <Tooltip>
                  <TooltipTrigger>{avatar}</TooltipTrigger>
                  <TooltipContent side="top">{item.name ?? 'Member'}</TooltipContent>
                </Tooltip>
              )}
              onOverflowClick={() => {
                /* Could open a popover with the remaining users — see the
                 * Storybook story `WithOverflowPopover` for the wire-up. */
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'lastSeenDays',
      header: 'Last seen',
      cell: ({ row }) =>
        row.original.lastSeenDays === 0 ? 'Today' : `${row.original.lastSeenDays}d ago`,
    },
  ];
}

const USER_FILTERS: ReadonlyArray<FilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Invited', label: 'Invited' },
      { value: 'Suspended', label: 'Suspended' },
    ],
  },
  {
    id: 'role',
    label: 'Role',
    type: 'multi-select',
    options: [
      { value: 'Admin', label: 'Admin' },
      { value: 'Member', label: 'Member' },
      { value: 'Viewer', label: 'Viewer' },
    ],
  },
  { id: 'email', label: 'Email', type: 'text', placeholder: 'contains…' },
];

function applyUserFilters(
  rows: ReadonlyArray<User>,
  query: string,
  active: ReadonlyArray<ActiveFilter>,
): User[] {
  const q = query.trim().toLowerCase();
  return rows.filter((u) => {
    if (q !== '' && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
      return false;
    }
    for (const af of active) {
      if (af.id === 'status' && typeof af.value === 'string' && af.value !== '') {
        if (u.status !== af.value) return false;
      } else if (af.id === 'role' && Array.isArray(af.value) && af.value.length > 0) {
        if (!af.value.includes(u.role)) return false;
      } else if (af.id === 'email' && typeof af.value === 'string' && af.value !== '') {
        if (!u.email.toLowerCase().includes(af.value.toLowerCase())) return false;
      }
    }
    return true;
  });
}

export function UsersTableContent({
  setSelected,
  selectedCount,
  onDelete,
}: {
  setSelected: (rows: User[]) => void;
  selectedCount: number;
  onDelete: () => void;
}) {
  const filters = useMemo(() => ({ pageSize: 1000 }), []);
  /*
   * useApiSuspenseQuery: throws a Promise while loading (caught by the
   * outer LoadingBoundary's <Suspense>) and throws ApiError on failure
   * (caught by its <ErrorBoundary>). `data` is always defined here.
   */
  const { data } = useApiSuspenseQuery<UsersResponse>(keys.users.list(filters), () =>
    api<UsersResponse>('/api/users', { query: filters }),
  );
  const columns = useMemo(() => makeUserColumns(data.data), [data.data]);

  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 200);
  const [activeFilters, setActiveFilters] = useState<ReadonlyArray<ActiveFilter>>([]);

  const filteredRows = useMemo(
    () => applyUserFilters(data.data, debounced, activeFilters),
    [data.data, debounced, activeFilters],
  );

  return (
    <div className="space-y-3">
      <FilterableSearch
        filters={USER_FILTERS}
        query={query}
        onQueryChange={setQuery}
        activeFilters={activeFilters}
        onActiveFiltersChange={setActiveFilters}
        placeholder="Search users by name, email…"
      />
      <DataTable<User>
        columns={columns}
        data={filteredRows}
        getRowId={(row) => row.id}
        enableRowSelection="multi"
        onRowSelectionChange={setSelected}
        enableGlobalFilter={false}
        pageSize={10}
        emptyState={
          <EmptyState
            icon={<UsersIcon className="h-6 w-6" />}
            title="No users match"
            description="Try removing filters or clearing the search."
          />
        }
        toolbar={{
          right:
            selectedCount > 0 ? (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={onDelete}
              >
                Delete {selectedCount}
              </Button>
            ) : null,
        }}
      />
    </div>
  );
}
