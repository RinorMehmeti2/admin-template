import { useState } from 'react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Input } from '@/components/forms/Input';
import { Pagination } from '@/components/navigation/Pagination';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/navigation/ContextMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { useToast } from '@/context/ToastProvider';
import { DemoBreadcrumbs } from './LayoutDemo';

const ROLES = ['admin', 'editor', 'viewer'] as const;
const STATUSES = ['active', 'invited', 'disabled'] as const;
const NAMES = [
  'Ada Lovelace',
  'Bob Marley',
  'Cher',
  'Diego Velazquez',
  'Eve Babitz',
  'Felix Mendelssohn',
  'Greta Garbo',
  'Henri Matisse',
  'Iris Murdoch',
  'Jorge Borges',
  'Klimt Gustav',
  'Linus Torvalds',
  'Maya Angelou',
  'Nikola Tesla',
];

const USERS = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  email: `${name.split(' ')[0]!.toLowerCase()}@example.com`,
  role: ROLES[i % ROLES.length]!,
  status: STATUSES[i % STATUSES.length]!,
}));

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: (typeof STATUSES)[number] }) {
  const variant = status === 'active' ? 'success' : status === 'invited' ? 'info' : 'neutral';
  return (
    <Badge variant={variant} dot>
      {status}
    </Badge>
  );
}

export function UsersPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(USERS.length / PAGE_SIZE);
  const slice = USERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-3">
        <DemoBreadcrumbs items={[{ label: 'Dashboard', to: '/layout' }, { label: 'Users' }]} />
      </div>
      <SimsPageHeader
        title="Users"
        description="Manage your team members and their permissions."
        actions={
          <>
            <Input
              placeholder="Search…"
              leftIcon={<Search className="h-4 w-4" />}
              inputSize="sm"
              className="w-56"
            />
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Invite
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs uppercase tracking-wide text-foreground-subtle">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {slice.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{u.name}</p>
                          <p className="truncate text-xs text-foreground-muted">{u.email}</p>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onSelect={() => toast.info(`Edit ${u.name}`)}>
                        Edit
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={() => toast.info(`Reset password for ${u.name}`)}>
                        Reset password
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onSelect={() => toast.error(`Removed ${u.name}`)}>
                        Remove
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </td>
                <td className="px-4 py-3 capitalize text-foreground-muted">{u.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <IconButton aria-label={`Actions for ${u.name}`} variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </IconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom-end">
                      <DropdownMenuItem onSelect={() => toast.info(`Edit ${u.name}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.info(`Disable ${u.name}`)}>
                        Disable
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.error(`Removed ${u.name}`)}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, USERS.length)} of{' '}
          {USERS.length}
        </p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
