import { NavLink, Outlet } from 'react-router-dom';
import {
  Compass,
  FormInput,
  LayoutDashboard,
  MessageSquareWarning,
  PanelsTopLeft,
  Search,
  Sparkles,
  Table,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Kbd } from '@/components/primitives/Kbd';
import { useCommandRegistry } from '@/components/overlays/CommandPalette';

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
  { to: '/layout', label: 'Layout', icon: <PanelsTopLeft className="h-4 w-4" /> },
];

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
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
