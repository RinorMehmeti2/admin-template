import {
  Bell,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Search,
  Settings,
  Sliders,
  User,
  Users,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Avatar } from '@/components/primitives/Avatar';
import { IconButton } from '@/components/primitives/IconButton';
import { Input } from '@/components/forms/Input';
import { Container } from '@/components/layout/Container';
import {
  PageShell,
  Sidebar,
  SidebarCollapseToggle,
  SidebarMobileToggle,
  Topbar,
} from '@/components/layout';
import { Menu, MenuBadge, MenuGroup, MenuItem } from '@/components/navigation/Menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { useToast } from '@/context/ToastProvider';

function UserMenu() {
  const { toast } = useToast();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar name="Ada Lovelace" size="sm" />
          <span className="hidden md:inline-block">Ada</span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-foreground-subtle md:inline-block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end">
        <DropdownMenuLabel>Signed in as ada@example.com</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.info('Profile clicked')}>
          <User className="mr-2 h-4 w-4" /> Profile
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info('Billing clicked')}>
          <CreditCard className="mr-2 h-4 w-4" /> Billing
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info('Settings clicked')}>
          <Settings className="mr-2 h-4 w-4" /> Settings
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.warning('Logged out')}>
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LayoutDemo() {
  return (
    <PageShell
      sidebar={
        <Sidebar
          header={
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">Acme Admin</span>
              <SidebarCollapseToggle />
            </div>
          }
          footer={
            <div className="flex items-center gap-2 px-2 py-1">
              <Avatar name="Ada Lovelace" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Ada Lovelace</p>
                <p className="truncate text-xs text-foreground-subtle">ada@example.com</p>
              </div>
            </div>
          }
        >
          <Menu>
            <MenuItem to="/layout" end icon={<Home />}>
              Dashboard
            </MenuItem>
            <MenuItem to="/layout/users" icon={<Users />} badge={<MenuBadge>14</MenuBadge>}>
              Users
            </MenuItem>
            <MenuGroup label="Configuration" icon={<Sliders />}>
              <MenuItem to="/layout/settings" icon={<Settings />}>
                Settings
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Sidebar>
      }
      topbar={
        <Topbar
          left={
            <>
              <SidebarMobileToggle />
              <span className="text-sm font-semibold md:hidden">Acme</span>
            </>
          }
          center={
            <Input
              placeholder="Search…"
              leftIcon={<Search className="h-4 w-4" />}
              className="max-w-md"
            />
          }
          right={
            <>
              <IconButton aria-label="Notifications" variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-danger" />
              </IconButton>
              <UserMenu />
            </>
          }
        />
      }
    >
      <Container className="py-6">
        <Outlet />
      </Container>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-pages                                                                  */
/* -------------------------------------------------------------------------- */

export { DashboardPage } from './DashboardPage';
export { UsersPage } from './UsersPage';
export { SettingsPage } from './SettingsPage';

/* Default export not used; we use named imports + nested routes. */
import { Plus } from 'lucide-react';
import {
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumbs,
} from '@/components/navigation/Breadcrumbs';

import { Card, CardContent } from '@/components/data-display/Card';

export function DemoCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card variant="outlined">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-foreground-muted">{title}</p>
        <p className="mt-1 text-3xl font-bold leading-none text-foreground">{value}</p>
        {hint !== undefined ? <p className="mt-2 text-xs text-foreground-muted">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function DemoBreadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <Breadcrumbs>
      {items.map((it, i) =>
        i === items.length - 1 || it.to === undefined ? (
          <BreadcrumbItem key={i}>
            <BreadcrumbCurrent>{it.label}</BreadcrumbCurrent>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem key={i}>
            <BreadcrumbLink to={it.to}>{it.label}</BreadcrumbLink>
          </BreadcrumbItem>
        ),
      )}
    </Breadcrumbs>
  );
}

export { Plus as PlusIcon };
