import { useMemo, useState } from 'react';
import { Download, Edit, Filter, KeyRound, Plus, Search, Trash2, X } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Pagination } from '@/components/navigation/Pagination';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { Label } from '@/components/forms/Label';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from '@/components/feedback/Drawer';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/context/ToastProvider';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_USERS, MOCK_ROLES, type SimsUser, type UserStatus } from '../data';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function UsersPage() {
  const { toast } = useToast();
  const [list, setList] = useState<SimsUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawer, setDrawer] = useState<Partial<SimsUser> | null>(null);
  const [confirmDel, setConfirmDel] = useState<SimsUser | null>(null);

  const filtered = useMemo(
    () =>
      list.filter(
        (u) =>
          search === '' ||
          (u.name + ' ' + u.surname + ' ' + u.email).toLowerCase().includes(search.toLowerCase()),
      ),
    [list, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const save = () => {
    if (drawer === null) return;
    if (drawer.id !== undefined) {
      setList((l) => l.map((u) => (u.id === drawer.id ? ({ ...u, ...drawer } as SimsUser) : u)));
      toast.success('User updated');
    } else {
      const next: SimsUser = {
        id: Date.now(),
        name: drawer.name ?? '',
        surname: drawer.surname ?? '',
        email: drawer.email ?? '',
        role: drawer.role ?? 'Teacher',
        status: drawer.status ?? 'Active',
        avatar: (drawer.name?.[0] ?? '?') + (drawer.surname?.[0] ?? '?'),
      };
      setList((l) => [...l, next]);
      toast.success('User created');
    }
    setDrawer(null);
  };

  const remove = () => {
    if (confirmDel === null) return;
    setList((l) => l.filter((u) => u.id !== confirmDel.id));
    toast.success('User deleted');
    setConfirmDel(null);
  };

  return (
    <>
      <SimsPageHeader
        title="Users"
        description="Manage user accounts, roles, and access."
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() =>
                setDrawer({ name: '', surname: '', email: '', role: 'Teacher', status: 'Active' })
              }
            >
              Add User
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          leftIcon={<Search className="h-4 w-4" />}
          placeholder="Search users by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md"
          inputSize="sm"
        />
        <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
          Filters
        </Button>
        <div className="ml-auto">
          <Badge variant="primary">{filtered.length} users</Badge>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface">
        <Table size="default">
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 60 }} />
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right" style={{ width: 120 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((u) => (
              <TableRow key={u.id} className="cursor-pointer" onClick={() => setDrawer({ ...u })}>
                <TableCell>
                  <Avatar name={`${u.name} ${u.surname}`} size="sm" />
                </TableCell>
                <TableCell className="font-semibold">
                  {u.name} {u.surname}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground-muted">{u.email}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="primary" size="sm">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === 'Active' ? 'success' : 'neutral'} size="sm">
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex gap-1">
                    <IconButton
                      aria-label="Edit"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDrawer({ ...u })}
                    >
                      <Edit className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      aria-label="Delete"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDel(u)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm">
          <div className="flex items-center gap-2 text-foreground-muted">
            <span>Rows per page:</span>
            <Select
              selectSize="sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="w-20"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            <span>
              {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)}{' '}
              of {filtered.length}
            </span>
          </div>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <Drawer
        open={drawer !== null}
        onOpenChange={(o) => (!o ? setDrawer(null) : undefined)}
        side="right"
      >
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>{drawer?.id !== undefined ? 'Edit User' : 'Add User'}</DrawerTitle>
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={() => setDrawer(null)}
            >
              <X className="h-4 w-4" />
            </IconButton>
          </DrawerHeader>
          {drawer !== null ? (
            <>
              <DrawerBody className="space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <Avatar name={`${drawer.name ?? 'New'} ${drawer.surname ?? 'User'}`} size="lg" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {drawer.name ?? 'New'} {drawer.surname ?? 'User'}
                    </p>
                    <p className="text-xs text-foreground-muted">{drawer.email ?? 'No email'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sims-user-first">First name</Label>
                    <Input
                      id="sims-user-first"
                      value={drawer.name ?? ''}
                      onChange={(e) => setDrawer((d) => ({ ...d, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sims-user-last">Surname</Label>
                    <Input
                      id="sims-user-last"
                      value={drawer.surname ?? ''}
                      onChange={(e) => setDrawer((d) => ({ ...d, surname: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sims-user-email">Email</Label>
                  <Input
                    id="sims-user-email"
                    type="email"
                    value={drawer.email ?? ''}
                    onChange={(e) => setDrawer((d) => ({ ...d, email: e.target.value }))}
                  />
                  <p className="text-xs text-foreground-subtle">They'll use this to sign in.</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sims-user-role">Role</Label>
                  <Select
                    id="sims-user-role"
                    value={drawer.role ?? ''}
                    onChange={(e) => setDrawer((d) => ({ ...d, role: e.target.value }))}
                  >
                    {MOCK_ROLES.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Account active</p>
                    <p className="text-xs text-foreground-muted">Inactive users can't sign in.</p>
                  </div>
                  <Switch
                    checked={drawer.status === 'Active'}
                    onChange={(e) =>
                      setDrawer((d) => ({
                        ...d,
                        status: (e.target.checked ? 'Active' : 'Inactive') as UserStatus,
                      }))
                    }
                  />
                </div>
                {drawer.id !== undefined ? (
                  <Button
                    variant="outline"
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    onClick={() => toast.success('Password reset email sent')}
                  >
                    Send password reset email
                  </Button>
                ) : null}
              </DrawerBody>
              <DrawerFooter className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDrawer(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={save}>
                  {drawer.id !== undefined ? 'Save changes' : 'Create user'}
                </Button>
              </DrawerFooter>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={confirmDel !== null}
        onOpenChange={(o) => (!o ? setConfirmDel(null) : undefined)}
        title="Delete user?"
        description={
          confirmDel !== null
            ? `This permanently removes ${confirmDel.name} ${confirmDel.surname} and revokes all access. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={remove}
      />
    </>
  );
}
