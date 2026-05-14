import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ArrowUpDown,
  Columns3,
  Filter,
  LayoutDashboard,
  ListTree,
  Loader,
  MoreHorizontal,
  Palette,
  SquareCheck,
  Copy,
  Eye,
  Mail,
  Trash2,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/data-display/DataTable';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { IconButton } from '@/components/primitives/IconButton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/navigation/DropdownMenu';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { Section } from './_shared/Section';
import { EMPLOYEE_DEPARTMENTS, getEmployeesWithReports } from './_shared/data';
import type { Employee } from './_shared/model';
import { employeeStatusVariant, formatDateShort, formatMoney } from './_shared/format';

interface CapabilityCard {
  to: string;
  titleKey: string;
  body: string;
  icon: ReactNode;
}

const CAPABILITIES: ReadonlyArray<CapabilityCard> = [
  {
    to: '/tables/styles',
    titleKey: 'nav.tables.styles',
    body: 'Variants, density, status-tinted rows, sticky scroll. Tokens drive every color.',
    icon: <Palette className="h-5 w-5" />,
  },
  {
    to: '/tables/sorting',
    titleKey: 'nav.tables.sorting',
    body: 'Single + multi sort, custom sortFn, non-sortable columns, default sort.',
    icon: <ArrowUpDown className="h-5 w-5" />,
  },
  {
    to: '/tables/filtering',
    titleKey: 'nav.tables.filtering',
    body: 'Global search, text, multi-select, range, date range — with chip strip.',
    icon: <Filter className="h-5 w-5" />,
  },
  {
    to: '/tables/selection',
    titleKey: 'nav.tables.selection',
    body: 'Single + multi-select, disabled rows, cross-page selection, bulk action bar.',
    icon: <SquareCheck className="h-5 w-5" />,
  },
  {
    to: '/tables/columns',
    titleKey: 'nav.tables.columns',
    body: 'Visibility menu, left / right pinning with sticky seams, sized columns.',
    icon: <Columns3 className="h-5 w-5" />,
  },
  {
    to: '/tables/sub-rows',
    titleKey: 'nav.tables.subRows',
    body: 'Nested trees, line-item panels, detail panels, expand-all toolbar.',
    icon: <ListTree className="h-5 w-5" />,
  },
  {
    to: '/tables/actions',
    titleKey: 'nav.tables.actions',
    body: 'Dropdown menus, inline icons, right-click context menu, destructive confirm.',
    icon: <MoreHorizontal className="h-5 w-5" />,
  },
  {
    to: '/tables/states',
    titleKey: 'nav.tables.states',
    body: 'Skeleton, empty, error + retry, density A/B selector.',
    icon: <Loader className="h-5 w-5" />,
  },
  {
    to: '/tables',
    titleKey: 'nav.tables.overview',
    body: 'You are here — overview + the everything-on table below.',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
];

function EmployeeActionsMenu({ employee }: { employee: Employee }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton aria-label={`Actions for ${employee.name}`} variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end">
        <DropdownMenuLabel>{employee.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="h-3.5 w-3.5" />
          View profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Mail className="h-3.5 w-3.5" />
          Send message
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigator.clipboard?.writeText(employee.email)}>
          <Copy className="h-3.5 w-3.5" />
          Copy email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-danger">
          <Trash2 className="h-3.5 w-3.5" />
          Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TablesOverviewPage() {
  const { t } = useTranslation();
  const data = useMemo(() => {
    // Promote first 8 employees (manager pool) to top of dataset and
    // attach reports — gives the expandable tree a clean starting set.
    const all = getEmployeesWithReports();
    const managers = all.filter((e) => e.managerId === null);
    return managers;
  }, []);

  const columns = useMemo<ColumnDef<Employee, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
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
      {
        accessorKey: 'department',
        header: 'Department',
        meta: {
          filterVariant: 'multi-select',
          filterOptions: EMPLOYEE_DEPARTMENTS.map((d) => ({ value: d, label: d })),
        },
      },
      { accessorKey: 'role', header: 'Role' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={employeeStatusVariant(row.original.status)} size="sm" dot>
            {row.original.status}
          </Badge>
        ),
        meta: {
          filterVariant: 'multi-select',
          filterOptions: [
            { value: 'active', label: 'active' },
            { value: 'on-leave', label: 'on-leave' },
            { value: 'terminated', label: 'terminated' },
          ],
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Started',
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground-muted">
            {formatDateShort(row.original.startDate)}
          </span>
        ),
        sortingFn: (a, b) => a.original.startDate.getTime() - b.original.startDate.getTime(),
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMoney(row.original.salary, 'USD')}</span>
        ),
      },
      {
        id: '__actions__',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        enablePinning: false,
        size: 56,
        cell: ({ row }) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <EmployeeActionsMenu employee={row.original} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('tables.overview.title')}
        description={t('tables.overview.subtitle')}
      />

      <ul
        aria-label="Capabilities"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CAPABILITIES.map((cap) => (
          <li key={cap.to}>
            <Link
              to={cap.to}
              className="group flex h-full items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {cap.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {t(cap.titleKey)}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-foreground-subtle transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 text-sm text-foreground-muted">{cap.body}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Section
        id="everything-on"
        eyebrow="Everything turned on"
        title={t('tables.overview.everythingTitle')}
        description={t('tables.overview.everythingSubtitle')}
        code={`<DataTable<Employee>
  columns={columns}
  data={data}
  getRowId={(r) => r.id}
  enableMultiSort
  enableColumnFilters
  enableRowSelection="multi"
  enableExpanding
  getSubRows={(r) => r.reports}
  searchPlaceholder="Search by name, email, role, department…"
  pageSize={8}
/>`}
      >
        <DataTable<Employee>
          columns={columns}
          data={data}
          getRowId={(r) => r.id}
          enableMultiSort
          enableColumnFilters
          enableRowSelection="multi"
          enableExpanding
          getSubRows={(r) => r.reports}
          searchPlaceholder="Search by name, email, role, department…"
          pageSize={8}
        />
      </Section>
    </div>
  );
}
