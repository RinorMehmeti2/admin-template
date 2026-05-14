import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowUpDown,
  BarChart3,
  Boxes,
  ChevronDown,
  Clock,
  Columns2,
  Columns3,
  Compass,
  Croissant,
  Database,
  Filter,
  FolderOpen,
  FolderTree,
  FormInput,
  Frame,
  Images,
  KanbanSquare,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  ListTree,
  LayoutGrid,
  Loader,
  LogIn,
  LogOut,
  MapPin,
  MessageSquareWarning,
  MoreHorizontal,
  Move,
  Palette as PaletteIcon,
  PanelsTopLeft,
  Rows,
  School,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareCheck,
  SquareDashedMousePointer,
  Stethoscope,
  Table,
  Type as TypeIcon,
  UploadCloud,
  UsersRound,
  Wheat,
  Zap,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ThemePicker } from '@/components/layout/ThemePicker';
import { TypographyPicker } from '@/components/layout/TypographyPicker';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import {
  NavGroup,
  NavLink,
  Sidebar,
  SidebarMobileToggle,
  SidebarProvider,
  useSidebar,
} from '@/components/layout/Sidebar';
import { Avatar } from '@/components/primitives/Avatar';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
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
import { NotificationsBell } from '@/components/feedback/NotificationsCenter';
import { useAuth } from '@/auth';
import { useLocale } from '@/context/LocaleProvider';

interface NavLeaf {
  to: string;
  labelKey: string;
  icon: React.ReactNode;
}

type NavEntry =
  | ({ kind: 'link' } & NavLeaf)
  | {
      kind: 'group';
      id: string;
      labelKey: string;
      icon: React.ReactNode;
      defaultOpen?: boolean;
      children: ReadonlyArray<NavLeaf>;
    };

// Note: `/layout` mounts <LayoutDemo /> at the router level — a different shell
// from <AppLayout>. Clicking the link leaves this sidebar entirely. Keeping it
// here so the surface stays reachable from the primary nav; existing behavior.
const NAV_TREE: ReadonlyArray<NavEntry> = [
  {
    kind: 'link',
    to: '/showcase',
    labelKey: 'nav.overview',
    icon: <Compass className="h-4 w-4" />,
  },
  {
    kind: 'group',
    id: 'croissant',
    labelKey: 'nav.group.croissant',
    // Brand mascot — always filled brown regardless of palette or theme.
    icon: (
      <Croissant
        aria-hidden="true"
        className="h-4 w-4"
        style={{ color: '#a3621f', fill: '#a3621f' }}
      />
    ),
    children: [
      {
        to: '/croissant/bakery-dashboard',
        labelKey: 'nav.croissant.bakeryDashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        to: '/croissant/cards-and-people',
        labelKey: 'nav.croissant.cardsAndPeople',
        icon: <UsersRound className="h-4 w-4" />,
      },
      {
        to: '/croissant/forms-bakery',
        labelKey: 'nav.croissant.formsBakery',
        icon: <Wheat className="h-4 w-4" />,
      },
      {
        to: '/croissant/feedback-theater',
        labelKey: 'nav.croissant.feedbackTheater',
        icon: <Stethoscope className="h-4 w-4" />,
      },
      {
        to: '/croissant/data-lab',
        labelKey: 'nav.croissant.dataLab',
        icon: <Database className="h-4 w-4" />,
      },
      {
        to: '/croissant/navigation-trail',
        labelKey: 'nav.croissant.navigationTrail',
        icon: <MapPin className="h-4 w-4" />,
      },
      {
        to: '/croissant/timeline-and-activity',
        labelKey: 'nav.croissant.timelineActivity',
        icon: <Activity className="h-4 w-4" />,
      },
    ],
  },
  {
    kind: 'group',
    id: 'components',
    labelKey: 'nav.group.components',
    icon: <Boxes className="h-4 w-4" />,
    children: [
      { to: '/primitives', labelKey: 'nav.primitives', icon: <Sparkles className="h-4 w-4" /> },
      {
        to: '/feedback',
        labelKey: 'nav.feedback',
        icon: <MessageSquareWarning className="h-4 w-4" />,
      },
      { to: '/data', labelKey: 'nav.dataDisplay', icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: '/dropzone', labelKey: 'nav.dropzone', icon: <UploadCloud className="h-4 w-4" /> },
      { to: '/motion', labelKey: 'nav.motion', icon: <Zap className="h-4 w-4" /> },
      {
        to: '/new-components',
        labelKey: 'nav.newComponents',
        icon: <Sparkles className="h-4 w-4" />,
      },
    ],
  },
  {
    kind: 'group',
    id: 'tables',
    labelKey: 'nav.group.tables',
    icon: <Table className="h-4 w-4" />,
    defaultOpen: true,
    children: [
      {
        to: '/tables',
        labelKey: 'nav.tables.overview',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        to: '/tables/styles',
        labelKey: 'nav.tables.styles',
        icon: <PaletteIcon className="h-4 w-4" />,
      },
      {
        to: '/tables/sorting',
        labelKey: 'nav.tables.sorting',
        icon: <ArrowUpDown className="h-4 w-4" />,
      },
      {
        to: '/tables/filtering',
        labelKey: 'nav.tables.filtering',
        icon: <Filter className="h-4 w-4" />,
      },
      {
        to: '/tables/selection',
        labelKey: 'nav.tables.selection',
        icon: <SquareCheck className="h-4 w-4" />,
      },
      {
        to: '/tables/columns',
        labelKey: 'nav.tables.columns',
        icon: <Columns3 className="h-4 w-4" />,
      },
      {
        to: '/tables/sub-rows',
        labelKey: 'nav.tables.subRows',
        icon: <ListTree className="h-4 w-4" />,
      },
      {
        to: '/tables/actions',
        labelKey: 'nav.tables.actions',
        icon: <MoreHorizontal className="h-4 w-4" />,
      },
      {
        to: '/tables/states',
        labelKey: 'nav.tables.states',
        icon: <Loader className="h-4 w-4" />,
      },
    ],
  },
  {
    kind: 'group',
    id: 'forms',
    labelKey: 'nav.group.forms',
    icon: <FormInput className="h-4 w-4" />,
    defaultOpen: true,
    children: [
      {
        to: '/forms',
        labelKey: 'nav.forms.overview',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      { to: '/forms/fields', labelKey: 'nav.forms.fields', icon: <Sparkles className="h-4 w-4" /> },
      {
        to: '/forms/layouts',
        labelKey: 'nav.forms.layouts',
        icon: <LayoutTemplate className="h-4 w-4" />,
      },
      {
        to: '/forms/validation',
        labelKey: 'nav.forms.validation',
        icon: <ShieldCheck className="h-4 w-4" />,
      },
      {
        to: '/forms/cards',
        labelKey: 'nav.forms.cards',
        icon: <LayoutGrid className="h-4 w-4" />,
      },
      { to: '/forms/tables', labelKey: 'nav.forms.tables', icon: <Table className="h-4 w-4" /> },
      {
        to: '/forms/multi-step',
        labelKey: 'nav.forms.multiStep',
        icon: <ListChecks className="h-4 w-4" />,
      },
      { to: '/forms/repeater', labelKey: 'nav.forms.repeater', icon: <Rows className="h-4 w-4" /> },
      { to: '/forms/async', labelKey: 'nav.forms.async', icon: <Loader className="h-4 w-4" /> },
    ],
  },
  {
    kind: 'group',
    id: 'data',
    labelKey: 'nav.group.data',
    icon: <Database className="h-4 w-4" />,
    children: [
      { to: '/tree', labelKey: 'nav.tree', icon: <FolderTree className="h-4 w-4" /> },
      { to: '/timeline', labelKey: 'nav.timeline', icon: <Clock className="h-4 w-4" /> },
      { to: '/charts', labelKey: 'nav.charts', icon: <BarChart3 className="h-4 w-4" /> },
      { to: '/kanban', labelKey: 'nav.kanban', icon: <KanbanSquare className="h-4 w-4" /> },
      { to: '/files', labelKey: 'nav.fileExplorer', icon: <FolderOpen className="h-4 w-4" /> },
      { to: '/gallery', labelKey: 'nav.gallery', icon: <Images className="h-4 w-4" /> },
    ],
  },
  {
    kind: 'group',
    id: 'layout',
    labelKey: 'nav.group.layout',
    icon: <LayoutTemplate className="h-4 w-4" />,
    children: [
      { to: '/layout', labelKey: 'nav.layout', icon: <PanelsTopLeft className="h-4 w-4" /> },
      { to: '/split', labelKey: 'nav.split', icon: <Columns2 className="h-4 w-4" /> },
      {
        to: '/focus',
        labelKey: 'nav.focus',
        icon: <SquareDashedMousePointer className="h-4 w-4" />,
      },
      { to: '/positioning', labelKey: 'nav.positioning', icon: <Move className="h-4 w-4" /> },
      { to: '/workspace', labelKey: 'nav.workspace', icon: <Frame className="h-4 w-4" /> },
    ],
  },
  {
    kind: 'link',
    to: '/playground',
    labelKey: 'nav.playground',
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
  {
    kind: 'group',
    id: 'settings',
    labelKey: 'nav.group.settings',
    icon: <SettingsIcon className="h-4 w-4" />,
    children: [
      {
        to: '/settings/theme',
        labelKey: 'nav.themeEditor',
        icon: <PaletteIcon className="h-4 w-4" />,
      },
      {
        to: '/settings/typography',
        labelKey: 'nav.typography',
        icon: <TypeIcon className="h-4 w-4" />,
      },
    ],
  },
  {
    kind: 'link',
    to: '/admin',
    labelKey: 'nav.admin',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    kind: 'group',
    id: 'sims',
    labelKey: 'nav.group.sims',
    icon: <School className="h-4 w-4" />,
    children: [
      {
        to: '/sims/dashboard',
        labelKey: 'nav.sims.dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/users',
        labelKey: 'nav.sims.users',
        icon: <UsersRound className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/roles',
        labelKey: 'nav.sims.roles',
        icon: <ShieldCheck className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/modules',
        labelKey: 'nav.sims.modules',
        icon: <LayoutGrid className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/menu',
        labelKey: 'nav.sims.menu',
        icon: <ListChecks className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/holidays',
        labelKey: 'nav.sims.holidays',
        icon: <Clock className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/email-configuration',
        labelKey: 'nav.sims.email',
        icon: <MessageSquareWarning className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/notifications',
        labelKey: 'nav.sims.notifications',
        icon: <MessageSquareWarning className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/reports',
        labelKey: 'nav.sims.reports',
        icon: <LayoutTemplate className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/statistics',
        labelKey: 'nav.sims.statistics',
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/logs',
        labelKey: 'nav.sims.logs',
        icon: <Activity className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/lookup-tables',
        labelKey: 'nav.sims.lookup',
        icon: <Table className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/theme-configuration',
        labelKey: 'nav.sims.theme',
        icon: <PaletteIcon className="h-4 w-4" />,
      },
      {
        to: '/sims/administration/schema-drift',
        labelKey: 'nav.sims.schemaDrift',
        icon: <Database className="h-4 w-4" />,
      },
    ],
  },
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
  const { isMobile, mobileOpen, setOpenGroupIds } = useSidebar();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const initialPathRef = useRef(pathname);

  // Scroll active NavLink into view on route change / mount. If the sidebar
  // is taller than the viewport, the active item is otherwise hidden below
  // the fold.
  useEffect(() => {
    if (isMobile && !mobileOpen) return;
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (active === null || active === undefined) return;
    if (typeof active.scrollIntoView !== 'function') return;
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname, isMobile, mobileOpen]);

  // On route change (after first mount), clear any manually-opened NavGroup ids
  // so auto-follow resumes for the new route's parent (and only that one stays open).
  // First-mount pathname is captured by ref so we don't wipe state before any
  // NavGroup has rendered.
  useEffect(() => {
    if (pathname === initialPathRef.current) return;
    initialPathRef.current = pathname;

    setOpenGroupIds((prev) => (prev.size === 0 ? prev : new Set()));
  }, [pathname, setOpenGroupIds]);

  return (
    <nav ref={navRef} aria-label={t('nav.ariaPrimary')}>
      <ul className="space-y-0.5">
        {NAV_TREE.map((entry) => {
          if (entry.kind === 'link') {
            return (
              <NavLink key={entry.to} to={entry.to} label={t(entry.labelKey)} icon={entry.icon} />
            );
          }
          return (
            <NavGroup
              key={entry.id}
              id={entry.id}
              label={t(entry.labelKey)}
              icon={entry.icon}
              {...(entry.defaultOpen === true ? { defaultOpen: true } : {})}
            >
              {entry.children.map((child) => (
                <NavLink key={child.to} to={child.to} label={t(child.labelKey)} icon={child.icon} />
              ))}
            </NavGroup>
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
          <main className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
