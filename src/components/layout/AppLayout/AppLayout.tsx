import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  ChevronDown,
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
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ThemePicker } from '@/components/layout/ThemePicker';
import { TypographyPicker } from '@/components/layout/TypographyPicker';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import {
  Sidebar,
  SidebarMobileToggle,
  SidebarProvider,
  useSidebar,
} from '@/components/layout/Sidebar';
import { Avatar } from '@/components/primitives/Avatar';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
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
  labelKey: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/showcase', labelKey: 'nav.overview', icon: <Compass className="h-4 w-4" /> },
  { to: '/new-components', labelKey: 'nav.newComponents', icon: <Sparkles className="h-4 w-4" /> },
  { to: '/motion', labelKey: 'nav.motion', icon: <Zap className="h-4 w-4" /> },
  { to: '/repeater', labelKey: 'nav.repeater', icon: <ListChecks className="h-4 w-4" /> },
  { to: '/primitives', labelKey: 'nav.primitives', icon: <Sparkles className="h-4 w-4" /> },
  { to: '/forms', labelKey: 'nav.forms', icon: <FormInput className="h-4 w-4" /> },
  {
    to: '/feedback',
    labelKey: 'nav.feedback',
    icon: <MessageSquareWarning className="h-4 w-4" />,
  },
  { to: '/data', labelKey: 'nav.dataDisplay', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/tables', labelKey: 'nav.tables', icon: <Table className="h-4 w-4" /> },
  { to: '/tree', labelKey: 'nav.tree', icon: <FolderTree className="h-4 w-4" /> },
  { to: '/timeline', labelKey: 'nav.timeline', icon: <Clock className="h-4 w-4" /> },
  { to: '/charts', labelKey: 'nav.charts', icon: <BarChart3 className="h-4 w-4" /> },
  { to: '/kanban', labelKey: 'nav.kanban', icon: <KanbanSquare className="h-4 w-4" /> },
  { to: '/files', labelKey: 'nav.fileExplorer', icon: <FolderOpen className="h-4 w-4" /> },
  { to: '/gallery', labelKey: 'nav.gallery', icon: <Images className="h-4 w-4" /> },
  { to: '/wizard', labelKey: 'nav.formWizard', icon: <ListChecks className="h-4 w-4" /> },
  { to: '/positioning', labelKey: 'nav.positioning', icon: <Move className="h-4 w-4" /> },
  { to: '/layout', labelKey: 'nav.layout', icon: <PanelsTopLeft className="h-4 w-4" /> },
  { to: '/split', labelKey: 'nav.split', icon: <Columns2 className="h-4 w-4" /> },
  { to: '/focus', labelKey: 'nav.focus', icon: <SquareDashedMousePointer className="h-4 w-4" /> },
  {
    to: '/playground',
    labelKey: 'nav.playground',
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
  { to: '/settings/theme', labelKey: 'nav.themeEditor', icon: <PaletteIcon className="h-4 w-4" /> },
  {
    to: '/settings/typography',
    labelKey: 'nav.typography',
    icon: <TypeIcon className="h-4 w-4" />,
  },
  { to: '/workspace', labelKey: 'nav.workspace', icon: <Frame className="h-4 w-4" /> },
  { to: '/admin', labelKey: 'nav.admin', icon: <ShieldCheck className="h-4 w-4" /> },
];

function AuthMenu() {
  const { user, state, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (state === 'authenticated' && user !== null) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t('auth.menu.accountFor', { name: user.name })}
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
              <ShieldCheck className="mr-2 h-4 w-4" /> {t('auth.menu.adminArea')}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={() => {
              void logout().then(() => navigate('/login'));
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> {t('auth.menu.logOut')}
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
      {t('auth.menu.signIn')}
    </Button>
  );
}

function SidebarBrand() {
  const { t } = useTranslation();
  const { isMobile, collapsed } = useSidebar();
  const brandName = t('brand.name');

  if (!isMobile && collapsed) {
    return (
      <div className="flex w-full items-center justify-center">
        <Avatar
          name={brandName}
          size="sm"
          className="rounded-md bg-primary text-primary-foreground"
        />
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <h1 className="truncate text-sm font-semibold leading-tight tracking-tight">{brandName}</h1>
      <p className="truncate text-[11px] leading-tight text-foreground-subtle">
        {t('brand.subtitle')}
      </p>
    </div>
  );
}

function PrimaryNav() {
  const { isMobile, collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const showLabels = isMobile || !collapsed;

  // Scroll the active NavLink into view on route change / mount. If sidebar
  // is overflowed, the active item is otherwise hidden below the fold.
  useEffect(() => {
    if (isMobile && !mobileOpen) return;
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (active === null || active === undefined) return;
    if (typeof active.scrollIntoView !== 'function') return;
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname, isMobile, mobileOpen]);

  return (
    <nav ref={navRef} aria-label={t('nav.ariaPrimary')}>
      <ul className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const label = t(item.labelKey);
          const link = (
            <NavLink
              to={item.to}
              onClick={() => {
                if (isMobile) setMobileOpen(false);
              }}
              aria-label={!showLabels ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors',
                  showLabels ? 'px-3' : 'justify-center px-2',
                  isActive
                    ? 'bg-surface-muted font-medium text-foreground'
                    : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
                )
              }
            >
              <span
                style={{ color: 'var(--color-primary)' }}
                className={cn('shrink-0', !showLabels && '[&>svg]:h-5 [&>svg]:w-5')}
              >
                {item.icon}
              </span>
              {showLabels ? <span className="truncate">{label}</span> : null}
            </NavLink>
          );
          return (
            <li key={item.to}>
              {!showLabels ? (
                <Tooltip>
                  <TooltipTrigger>{link}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {label}
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
  );
}

function PrimarySidebar() {
  const { t } = useTranslation();
  return (
    <Sidebar header={<SidebarBrand />} mobileTitle={t('brand.name')}>
      <PrimaryNav />
    </Sidebar>
  );
}

interface NotificationsLabels {
  title: string;
  markAllRead: string;
  filterAll: string;
  filterUnread: string;
  empty: string;
  emptyDescription: string;
  loading: string;
  remove: string;
  closeLabel: string;
  bellLabel: string;
  unreadSuffix: (count: number) => string;
}

function AppTopbar({
  notificationsLabels,
  locale,
}: {
  notificationsLabels: NotificationsLabels;
  locale: string;
}) {
  const { openPalette } = useCommandRegistry();
  const { isMobile } = useSidebar();
  const { t } = useTranslation();

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-4 md:px-6"
      data-print="hide"
    >
      <SidebarMobileToggle />

      {isMobile ? (
        <IconButton
          aria-label={t('topbar.searchCommands')}
          aria-haspopup="dialog"
          variant="ghost"
          size="sm"
          onClick={openPalette}
        >
          <Search className="h-4 w-4" />
        </IconButton>
      ) : (
        <button
          type="button"
          onClick={openPalette}
          aria-label={t('topbar.openPalette')}
          aria-haspopup="dialog"
          className="group flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border bg-surface-muted/50 px-3 text-sm text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="flex-1 text-left">{t('topbar.searchCommandsPlaceholder')}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {!isMobile ? (
          <>
            <LocaleSwitcher />
            <NotificationsBell labels={notificationsLabels} locale={locale} />
            <ThemePicker />
            <TypographyPicker />
          </>
        ) : (
          <NotificationsBell labels={notificationsLabels} locale={locale} />
        )}
        <ThemeToggle />
        <AuthMenu />
      </div>
    </header>
  );
}

export function AppLayout() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const notificationsLabels: NotificationsLabels = {
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
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <PrimarySidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar notificationsLabels={notificationsLabels} locale={locale} />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
