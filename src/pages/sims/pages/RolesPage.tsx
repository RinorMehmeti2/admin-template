import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  LayoutGrid,
  Lock,
  Plus,
  Save,
  Search,
  SearchX,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent } from '@/components/data-display/Card';
import { Progress } from '@/components/feedback/Progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Input } from '@/components/forms/Input';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_MODULES, MOCK_ROLES, type SimsRole } from '../data';

type Grants = Record<string, Record<string, boolean>>;

interface PermissionsState {
  role: SimsRole;
  grants: Grants;
}

function makeGrants(role: SimsRole): Grants {
  const out: Grants = {};
  MOCK_MODULES.forEach((m) => {
    const ops: Record<string, boolean> = {};
    m.operations.forEach((op) => {
      ops[op.key] =
        role.name === 'Admin' ||
        (op.key === 'view' && role.name !== 'Parent') ||
        (Math.random() > 0.65 && role.name !== 'Auditor');
    });
    out[m.key] = ops;
  });
  return out;
}

export function RolesPage() {
  const { toast } = useToast();
  const [perms, setPerms] = useState<PermissionsState | null>(null);
  const [filter, setFilter] = useState('');

  const open = (role: SimsRole) => {
    setPerms({ role, grants: makeGrants(role) });
    setFilter('');
  };

  if (perms !== null) {
    return (
      <PermissionsView
        perms={perms}
        setPerms={setPerms}
        filter={filter}
        setFilter={setFilter}
        onSave={() => {
          toast.success(`Permissions for ${perms.role.name} saved`);
          setPerms(null);
        }}
      />
    );
  }

  return (
    <>
      <SimsPageHeader
        title="Roles"
        description="Define what each role can do in the system."
        actions={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Add Role
          </Button>
        }
      />
      <div className="rounded-md border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ROLES.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">{r.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground-muted">{r.description}</span>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {r.users.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Lock className="h-3.5 w-3.5" />}
                    onClick={() => open(r)}
                  >
                    Manage Permissions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

interface PermissionsViewProps {
  perms: PermissionsState;
  setPerms: (next: PermissionsState | null) => void;
  filter: string;
  setFilter: (next: string) => void;
  onSave: () => void;
}

function PermissionsView({ perms, setPerms, filter, setFilter, onSave }: PermissionsViewProps) {
  const visibleModules = useMemo(
    () =>
      MOCK_MODULES.filter(
        (m) => filter === '' || m.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    [filter],
  );

  const total = MOCK_MODULES.reduce((acc, m) => acc + m.operations.length, 0);
  const checked = MOCK_MODULES.reduce(
    (acc, m) => acc + m.operations.filter((op) => perms.grants[m.key]?.[op.key] === true).length,
    0,
  );

  const toggleOp = (modKey: string, opKey: string) =>
    setPerms({
      ...perms,
      grants: {
        ...perms.grants,
        [modKey]: {
          ...perms.grants[modKey],
          [opKey]: !perms.grants[modKey]?.[opKey],
        },
      },
    });

  const setAllForModule = (modKey: string, value: boolean) => {
    const mod = MOCK_MODULES.find((m) => m.key === modKey);
    if (mod === undefined) return;
    const next: Record<string, boolean> = {};
    mod.operations.forEach((op) => {
      next[op.key] = value;
    });
    setPerms({
      ...perms,
      grants: { ...perms.grants, [modKey]: next },
    });
  };

  const setAll = (value: boolean) => {
    const next: Grants = {};
    MOCK_MODULES.forEach((m) => {
      const ops: Record<string, boolean> = {};
      m.operations.forEach((op) => {
        ops[op.key] = value;
      });
      next[m.key] = ops;
    });
    setPerms({ ...perms, grants: next });
  };
  const grantAll = () => setAll(true);
  const clearAll = () => setAll(false);

  return (
    <>
      <SimsPageHeader
        title={`Permissions · ${perms.role.name}`}
        description={perms.role.description}
        actions={
          <>
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => setPerms(null)}
            >
              Back
            </Button>
            <Button variant="primary" leftIcon={<Save className="h-4 w-4" />} onClick={onSave}>
              Save Changes
            </Button>
          </>
        }
      />

      <Card variant="outlined" className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">
              {checked} / {total} granted
            </Badge>
            <Progress
              value={Math.round((checked / Math.max(total, 1)) * 100)}
              className="min-w-48 flex-1"
              size="sm"
            />
            <span className="min-w-9 text-right font-mono text-xs">
              {Math.round((checked / Math.max(total, 1)) * 100)}%
            </span>
            <div className="basis-full" />
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Filter modules…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              inputSize="sm"
              className="min-w-64"
            />
            <div className="ml-auto flex gap-1">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                onClick={grantAll}
              >
                Grant all
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<X className="h-3.5 w-3.5" />}
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleModules.map((m) => {
          const ops = m.operations;
          const granted = ops.filter((op) => perms.grants[m.key]?.[op.key] === true).length;
          const pct = ops.length === 0 ? 0 : Math.round((granted / ops.length) * 100);
          const allOn = granted === ops.length && ops.length > 0;
          const noneOn = granted === 0;
          const r = 18;
          const c = 2 * Math.PI * r;
          const dash = (pct / 100) * c;

          return (
            <Card
              key={m.key}
              variant="outlined"
              className={cn(
                'flex flex-col transition-shadow hover:shadow-md',
                noneOn ? '' : 'border-primary/40',
                m.enabled ? '' : 'opacity-60',
              )}
            >
              <div className="flex items-start gap-3 p-4 pb-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <p className="truncate font-bold">{m.name}</p>
                    {!m.enabled ? (
                      <Badge size="sm" variant="neutral">
                        Disabled
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mb-1 truncate font-mono text-xs text-foreground-muted">{m.key}</p>
                  <p className="line-clamp-2 text-xs text-foreground-muted">{m.description}</p>
                </div>
                <div className="relative h-12 w-12 shrink-0">
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r={r}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-border"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r={r}
                      fill="none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${c}`}
                      transform="rotate(-90 24 24)"
                      className={pct === 100 ? 'stroke-success' : 'stroke-primary'}
                      style={{ transition: 'stroke-dasharray 0.3s' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold">
                    {granted}/{ops.length}
                  </div>
                </div>
              </div>
              <div className="border-t border-border" />
              <div className="flex flex-1 flex-wrap content-start gap-2 p-3">
                {ops.map((op) => {
                  const on = perms.grants[m.key]?.[op.key] === true;
                  return (
                    <button
                      key={op.key}
                      type="button"
                      onClick={() => toggleOp(m.key, op.key)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        on
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-surface text-foreground-muted hover:bg-surface-muted',
                      )}
                    >
                      {on ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {op.label}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between bg-surface-muted px-3 py-2 text-xs">
                <span className={noneOn ? 'text-foreground-subtle' : 'text-foreground-muted'}>
                  {noneOn ? 'No permissions' : allOn ? 'Full access' : `${pct}% granted`}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={allOn}
                    onClick={() => setAllForModule(m.key, true)}
                    className="h-6 px-2 text-[11px]"
                  >
                    Select all
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={noneOn}
                    onClick={() => setAllForModule(m.key, false)}
                    className="h-6 px-2 text-[11px]"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
        {visibleModules.length === 0 ? (
          <Card variant="outlined" className="col-span-full">
            <CardContent className="p-10 text-center">
              <SearchX className="mx-auto mb-2 h-9 w-9 text-foreground-subtle" />
              <p className="text-sm text-foreground-muted">No modules match "{filter}".</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
