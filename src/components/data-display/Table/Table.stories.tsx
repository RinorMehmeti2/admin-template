import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table';

export default { title: 'Data Display/Table', component: Table };

const rows = [
  { name: 'Ada Lovelace', role: 'Admin', status: 'Active' },
  { name: 'Grace Hopper', role: 'Member', status: 'Active' },
  { name: 'Linus Torvalds', role: 'Owner', status: 'Suspended' },
];

function Demo({
  variant,
  size,
}: {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'dense' | 'default' | 'comfortable';
}) {
  return (
    <Table variant={variant} size={size}>
      <TableCaption>Team members</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.name}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>{r.role}</TableCell>
            <TableCell>{r.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const Default = { render: () => <Demo /> };
export const Striped = { render: () => <Demo variant="striped" /> };
export const Bordered = { render: () => <Demo variant="bordered" /> };
export const Dense = { render: () => <Demo size="dense" /> };
export const Comfortable = { render: () => <Demo size="comfortable" /> };
