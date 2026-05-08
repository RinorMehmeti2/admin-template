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
