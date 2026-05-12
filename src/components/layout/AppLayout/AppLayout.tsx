import { useCallback, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns2,
  Compass,
  FolderOpen,
  FolderTree,
  FormInput,
  Frame,
  Images,
  KanbanSquare,
  ListChecks,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareWarning,
  Move,
  Palette as PaletteIcon,
  PanelsTopLeft,
  Type as TypeIcon,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareDashedMousePointer,
  Table,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ThemePicker } from '@/components/layout/ThemePicker';
import { TypographyPicker } from '@/components/layout/TypographyPicker';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Avatar } from '@/components/primitives/Avatar';
import { Button } from '@/components/primitives/Button';
import { Kbd } from '@/components/primitives/Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import { useCommandRegistry } from '@/components/overlays/CommandPalette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { NotificationsBell } from '@/components/feedback/NotificationsCenter';
import { useAuth } from '@/auth';
import { useLocale } from '@/context/LocaleProvider';

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
  { to: '/tree', label: 'Tree', icon: <FolderTree className="h-4 w-4" /> },
  { to: '/timeline', label: 'Timeline', icon: <Clock className="h-4 w-4" /> },
  { to: '/charts', label: 'Charts', icon: <BarChart3 className="h-4 w-4" /> },
  { to: '/kanban', label: 'Kanban', icon: <KanbanSquare className="h-4 w-4" /> },
  { to: '/files', label: 'File explorer', icon: <FolderOpen className="h-4 w-4" /> },
  { to: '/gallery', label: 'Gallery', icon: <Images className="h-4 w-4" /> },
  { to: '/wizard', label: 'Form wizard', icon: <ListChecks className="h-4 w-4" /> },
  { to: '/positioning', label: 'Positioning', icon: <Move className="h-4 w-4" /> },
  { to: '/layout', label: 'Layout', icon: <PanelsTopLeft className="h-4 w-4" /> },
  { to: '/split', label: 'Split', icon: <Columns2 className="h-4 w-4" /> },
  { to: '/focus', label: 'Focus', icon: <SquareDashedMousePointer className="h-4 w-4" /> },
  { to: '/playground', label: 'Playground', icon: <SlidersHorizontal className="h-4 w-4" /> },
  { to: '/settings/theme', label: 'Theme editor', icon: <PaletteIcon className="h-4 w-4" /> },
  { to: '/settings/typography', label: 'Typography', icon: <TypeIcon className="h-4 w-4" /> },
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

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppLayout() {
  const { openPalette } = useCommandRegistry();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [collapsed, setCollapsed] = useState<boolean>(readStoredCollapsed);
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // ignore (private mode, etc.)
      }
      return next;
    });
  }, []);
  const notificationsLabels = {
    title: t('notifications.title'),
    markAllRead: t('notifications.markAllRead'),
    filterAll: t('notifications.filter.all'),
    filterUnread: t('notifications.filter.unread'),
    empty: t('notifications.empty'),
    emptyDescription: t('notifications.emptyDescription'),
    loading: t('notifications.loading'),
    remove: t('notifications.remove'),
    closeLabel: t('notifications.closeLabel'),
    bellLabel: t('notifications.bellLabel'),
    unreadSuffix: (count: number) => (count > 0 ? t('notifications.unreadSuffix', { count }) : ''),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside
        className={cn(
          'relative flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-60',
        )}
        data-print="hide"
        data-collapsed={collapsed}
      >
        <div
          className={cn(
            'flex h-14 shrink-0 items-center gap-2 border-b border-border',
            collapsed ? 'justify-center px-2' : 'px-3',
          )}
        >
          {collapsed ? null : (
            <div className="min-w-0 pr-8 pl-2">
              <h1 className="truncate text-sm font-semibold leading-tight tracking-tight">
                Admin Template
              </h1>
              <p className="truncate text-[11px] leading-tight text-foreground-subtle">
                Component library
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={toggleCollapsed}
          className="absolute top-7 right-0 z-30 flex h-7 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted shadow-md transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
        <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label="Primary">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const link = (
                <NavLink
                  to={item.to}
                  aria-label={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors',
                      collapsed ? 'justify-center px-2' : 'px-3',
                      isActive
                        ? 'bg-surface-muted font-medium text-foreground'
                        : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
                    )
                  }
                >
                  <span className="shrink-0 text-foreground-subtle">{item.icon}</span>
                  {collapsed ? null : <span className="truncate">{item.label}</span>}
                </NavLink>
              );
              return (
                <li key={item.to}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-6"
          data-print="hide"
        >
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
            <NotificationsBell labels={notificationsLabels} locale={locale} />
            <ThemePicker />
            <TypographyPicker />
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
