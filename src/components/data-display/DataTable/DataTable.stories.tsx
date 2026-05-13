import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const users: User[] = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'Admin' : 'Member',
}));

const columns: ColumnDef<User, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
];

export default { title: 'Data Display/DataTable', component: DataTable };

export const Basic = {
  render: () => <DataTable columns={columns} data={users} />,
};

export const WithSelection = {
  render: () => (
    <DataTable columns={columns} data={users} enableRowSelection="multi" />
  ),
};

export const Loading = {
  render: () => <DataTable columns={columns} data={[]} isLoading />,
};

export const Empty = {
  render: () => <DataTable columns={columns} data={[]} />,
};

/* ------------------------------ Extensions ------------------------------- */

interface Node {
  id: string;
  name: string;
  role: string;
  reports?: Node[];
}

const tree: Node[] = [
  {
    id: 'a',
    name: 'Alex Ramirez',
    role: 'Engineering Manager',
    reports: [
      { id: 'a1', name: 'Bao Cruz', role: 'Senior Engineer' },
      { id: 'a2', name: 'Cara Dao', role: 'Engineer' },
      {
        id: 'a3',
        name: 'Drew Eklund',
        role: 'Senior Engineer',
        reports: [{ id: 'a3a', name: 'Emi Fernandez', role: 'Engineer' }],
      },
    ],
  },
  { id: 'b', name: 'Beth Whittaker', role: 'Product Manager' },
];

const treeColumns: ColumnDef<Node, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
];

export const ExpandableSubRows = {
  name: 'Extension: expandable sub-rows',
  render: () => (
    <DataTable
      columns={treeColumns}
      data={tree}
      enableExpanding
      getSubRows={(r) => r.reports}
      enableGlobalFilter={false}
      enableColumnVisibility={false}
      defaultExpanded
    />
  ),
};

export const ExpandedRowPanel = {
  name: 'Extension: renderExpandedRow panel',
  render: () => (
    <DataTable
      columns={treeColumns}
      data={tree}
      enableExpanding
      renderExpandedRow={(row) => (
        <div className="text-sm text-foreground-muted">
          Detail panel for <span className="font-medium text-foreground">{row.original.name}</span>{' '}
          ({row.original.role})
        </div>
      )}
      enableGlobalFilter={false}
      enableColumnVisibility={false}
    />
  ),
};

interface Person {
  id: number;
  name: string;
  department: string;
  status: string;
  salary: number;
}

const people: Person[] = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  department: ['Engineering', 'Design', 'Sales'][i % 3]!,
  status: ['active', 'on-leave', 'terminated'][i % 3]!,
  salary: 60000 + (i * 1737) % 90000,
}));

const facetedColumns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'department',
    header: 'Department',
    meta: {
      filterVariant: 'multi-select',
      filterOptions: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Design', value: 'Design' },
        { label: 'Sales', value: 'Sales' },
      ],
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      filterVariant: 'select',
      filterOptions: [
        { label: 'active', value: 'active' },
        { label: 'on-leave', value: 'on-leave' },
        { label: 'terminated', value: 'terminated' },
      ],
    },
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    meta: { filterVariant: 'range' },
  },
];

export const FacetedFilters = {
  name: 'Extension: faceted filters',
  render: () => (
    <DataTable
      columns={facetedColumns}
      data={people}
      enableColumnFilters
      enableGlobalFilter={false}
      pageSize={10}
    />
  ),
};

export const ColumnPinning = {
  name: 'Extension: column pinning',
  render: () => (
    <DataTable
      columns={[
        { accessorKey: 'name', header: 'Name', size: 180 },
        { accessorKey: 'department', header: 'Department', size: 160 },
        { accessorKey: 'status', header: 'Status', size: 140 },
        { accessorKey: 'salary', header: 'Salary', size: 140 },
      ]}
      data={people}
      enableColumnPinning
      defaultColumnPinning={{ left: ['name'], right: ['salary'] }}
      enableGlobalFilter={false}
      pageSize={10}
    />
  ),
};
