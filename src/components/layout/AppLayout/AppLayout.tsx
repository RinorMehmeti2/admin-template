import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronDown,
  Columns2,
  Compass,
  FormInput,
  Frame,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareWarning,
  Move,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  Sparkles,
  SquareDashedMousePointer,
  Table,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Avatar } from '@/components/primitives/Avatar';
import { Button } from '@/components/primitives/Button';
import { Kbd } from '@/components/primitives/Kbd';
import { useCommandRegistry } from '@/components/overlays/CommandPalette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { useAuth } from '@/auth';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/showcase', label: 'Overview', icon: <Compass className="h-4 w-4" /> },
  { to: '/primitives', label: 'Primitives', icon: <Sparkles className="h-4 w-4" /> },
  { to: '/forms', label: 'Forms', icon: <FormInput className="h-4 w-4" /> },
  {
    to: '/feedback',
    label: 'Feedback',
    icon: <MessageSquareWarning className="h-4 w-4" />,
  },
  { to: '/data', label: 'Data display', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/tables', label: 'Tables', icon: <Table className="h-4 w-4" /> },
  { to: '/charts', label: 'Charts', icon: <BarChart3 className="h-4 w-4" /> },
  { to: '/positioning', label: 'Positioning', icon: <Move className="h-4 w-4" /> },
  { to: '/layout', label: 'Layout', icon: <PanelsTopLeft className="h-4 w-4" /> },
  { to: '/split', label: 'Split', icon: <Columns2 className="h-4 w-4" /> },
  { to: '/focus', label: 'Focus', icon: <SquareDashedMousePointer className="h-4 w-4" /> },
  { to: '/workspace', label: 'Workspace', icon: <Frame className="h-4 w-4" /> },
  { to: '/admin', label: 'Admin', icon: <ShieldCheck className="h-4 w-4" /> },
];

function AuthMenu() {
  const { user, state, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  if (state === 'authenticated' && user !== null) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`Account menu for ${user.name}`}
          >
            <Avatar name={user.name} size="sm" />
            <span className="hidden md:inline-block">{user.name}</span>
            <ChevronDown
              className="hidden h-3.5 w-3.5 text-foreground-subtle md:inline-block"
              aria-hidden="true"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom-end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{user.name}</span>
              <span className="text-xs font-normal text-foreground-subtle">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {hasRole('admin') ? (
            <DropdownMenuItem onSelect={() => navigate('/admin')}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Admin area
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={() => {
              void logout().then(() => navigate('/login'));
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      leftIcon={<LogIn className="h-4 w-4" />}
      onClick={() => navigate('/login')}
    >
      Sign in
    </Button>
  );
}

export function AppLayout() {
  const { openPalette } = useCommandRegistry();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 shrink-0 border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h1 className="text-base font-semibold tracking-tight">Admin Template</h1>
          <p className="mt-0.5 text-xs text-foreground-subtle">Component library</p>
        </div>
        <nav className="p-3" aria-label="Primary">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-surface-muted font-medium text-foreground'
                        : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
                    )
                  }
                >
                  <span className="text-foreground-subtle">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-6">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            aria-haspopup="dialog"
            className="group flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border bg-surface-muted/50 px-3 text-sm text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search commands…</span>
            <span className="ml-auto flex shrink-0 items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <AuthMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
