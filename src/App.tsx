import { useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrimitivesPage } from '@/pages/demos/primitives';
import {
  FormsLayout,
  FormsOverviewPage,
  FormFieldsPage,
  FormLayoutsPage,
  FormValidationPage,
  FormCardsPage,
  FormTablesPage,
  FormMultiStepPage,
  FormRepeaterPage,
  FormAsyncPage,
} from '@/pages/demos/forms';
import { FeedbackPage } from '@/pages/demos/feedback';
import { DataPage } from '@/pages/demos/data';
import { PositioningPage } from '@/pages/demos/positioning';
import { ShowcasePage } from '@/pages/demos/showcase';
import { SplitDemoPage } from '@/pages/demos/split';
import { FocusDemoPage } from '@/pages/demos/focus';
import { DashboardPage, LayoutDemo, SettingsPage, UsersPage } from '@/pages/demos/layout';
import { ToastProvider } from '@/context/ToastProvider';
import { ThemeProvider, useTheme } from '@/context/ThemeProvider';
import { LocaleProvider } from '@/context/LocaleProvider';
import { TooltipProvider } from '@/components/feedback/Tooltip';
import {
  CommandPalette,
  CommandRegistryProvider,
  useCommandRegistry,
  useRegisterCommands,
} from '@/components/overlays/CommandPalette';
import { AuthProvider, ProtectedRoute, PublicOnlyRoute, RoleGate } from '@/auth';
import { ApiAuthBridge, ErrorBridge, QueryProvider } from '@/data';
import { NotificationsProvider } from '@/notifications';
import { RootRouterErrorElement, RouterErrorElement } from '@/components/feedback/ErrorBoundary';
import { ErrorsDemoPage } from '@/pages/demos/errors';
import { LoginPage } from '@/pages/auth/login';
import { VerifyPage } from '@/pages/auth/verify';
import { PrintPreviewPage } from '@/pages/demos/print-preview';
import { TreePage } from '@/pages/demos/tree';
import { TimelinePage } from '@/pages/demos/timeline';
import { DragDropSandboxPage } from '@/pages/demos/drag-drop';
import { KanbanPage } from '@/pages/demos/kanban';
import { FileExplorerPage } from '@/pages/file-explorer';
import { GalleryPage } from '@/pages/demos/gallery';
import { SearchPage } from '@/pages/demos/search';
import { MobilePreviewPage } from '@/pages/demos/mobile-preview';
import { NewComponentsPage } from '@/pages/demos/new-components';
import { MotionPage } from '@/pages/demos/motion';
import { DropzonePage } from '@/pages/demos/dropzone';
import { PlaygroundPage } from '@/pages/playground';
import { ThemeEditorPage } from '@/pages/settings/theme';
import { TypographyEditorPage } from '@/pages/settings/typography';
import { BakeryDashboardPage } from '@/pages/demos/croissant/bakery-dashboard';
import { CardsAndPeoplePage } from '@/pages/demos/croissant/cards-and-people';
import { FormsBakeryPage } from '@/pages/demos/croissant/forms-bakery';
import { FeedbackTheaterPage } from '@/pages/demos/croissant/feedback-theater';
import { DataLabPage } from '@/pages/demos/croissant/data-lab';
import { NavigationTrailPage } from '@/pages/demos/croissant/navigation-trail';
import { TimelineActivityPage } from '@/pages/demos/croissant/timeline-and-activity';
import {
  SimsLayout,
  DashboardPage as SimsDashboardPage,
  UsersPage as SimsUsersPage,
  RolesPage as SimsRolesPage,
  ModulesPage as SimsModulesPage,
  MenuPage as SimsMenuPage,
  HolidaysPage as SimsHolidaysPage,
  EmailConfigPage as SimsEmailConfigPage,
  NotificationsPage as SimsNotificationsPage,
  ReportsPage as SimsReportsPage,
  StatisticsPage as SimsStatisticsPage,
  LogsPage as SimsLogsPage,
  LookupTablesPage as SimsLookupTablesPage,
  ThemeConfigPage as SimsThemeConfigPage,
  SchemaDriftPage as SimsSchemaDriftPage,
} from '@/pages/sims';

/*
 * Code splitting strategy.
 *
 * react-router v7's `lazy` route option fires the dynamic import on
 * navigation and waits before rendering — no Suspense boundary required at
 * the route boundary. Each lazy() factory becomes its own chunk.
 *
 * Eager (in main bundle): auth, AppLayout, theme, i18n, primitives, forms
 *   shell, feedback, data display, positioning, showcase, layout demo. These
 *   are touched on most navigations and would just be re-fetched as chunks
 *   with no benefit.
 *
 * Lazy: routes that pull a heavy carve-out or are rarely visited:
 *   - /charts    → recharts
 *   - /tables    → tanstack-table
 *   - /workspace → FullscreenWorkspace + heavy demo data
 *   - /admin     → only loads after a role check passes anyway
 *
 * RichTextEditor (TipTap + ProseMirror) is lazy-loaded inside the Forms hub
 * via React.lazy + Suspense — see components/forms/RichTextEditor/lazy.tsx.
 */

interface NavCommand {
  to: string;
  labelKey: string;
  keywords: string[];
}

const NAV_COMMANDS: ReadonlyArray<NavCommand> = [
  { to: '/showcase', labelKey: 'nav.overview', keywords: ['home', 'index', 'showcase'] },
  { to: '/primitives', labelKey: 'nav.primitives', keywords: ['button', 'badge', 'avatar'] },
  {
    to: '/forms',
    labelKey: 'nav.forms.overview',
    keywords: ['forms', 'overview', 'rhf', 'zod'],
  },
  {
    to: '/forms/fields',
    labelKey: 'nav.forms.fields',
    keywords: ['forms', 'input', 'select', 'checkbox', 'combobox', 'rating'],
  },
  {
    to: '/forms/layouts',
    labelKey: 'nav.forms.layouts',
    keywords: ['forms', 'layout', 'columns', 'sectioned', 'sidebar'],
  },
  {
    to: '/forms/validation',
    labelKey: 'nav.forms.validation',
    keywords: ['forms', 'validation', 'zod', 'async', '422', 'errors'],
  },
  {
    to: '/forms/cards',
    labelKey: 'nav.forms.cards',
    keywords: ['forms', 'cards', 'selectable', 'plan', 'nested'],
  },
  {
    to: '/forms/tables',
    labelKey: 'nav.forms.tables',
    keywords: ['forms', 'tables', 'line items', 'invoice', 'fieldarray'],
  },
  {
    to: '/forms/multi-step',
    labelKey: 'nav.forms.multiStep',
    keywords: ['forms', 'wizard', 'multistep', 'stepper', 'onboarding'],
  },
  {
    to: '/forms/repeater',
    labelKey: 'nav.forms.repeater',
    keywords: ['forms', 'repeater', 'array', 'rows', 'add', 'remove'],
  },
  {
    to: '/forms/async',
    labelKey: 'nav.forms.async',
    keywords: ['forms', 'async', 'autosave', 'submit', 'dirty', 'optimistic'],
  },
  { to: '/feedback', labelKey: 'nav.feedback', keywords: ['toast', 'alert', 'dialog'] },
  {
    to: '/data',
    labelKey: 'commandPalette.cmd.dataDisplayLabel',
    keywords: ['card', 'stat', 'list'],
  },
  {
    to: '/tables',
    labelKey: 'nav.tables.overview',
    keywords: ['tables', 'datatable', 'overview'],
  },
  {
    to: '/tables/styles',
    labelKey: 'nav.tables.styles',
    keywords: ['tables', 'styles', 'variants', 'density', 'striped', 'bordered'],
  },
  {
    to: '/tables/sorting',
    labelKey: 'nav.tables.sorting',
    keywords: ['tables', 'sort', 'sorting', 'multi-sort'],
  },
  {
    to: '/tables/filtering',
    labelKey: 'nav.tables.filtering',
    keywords: ['tables', 'filter', 'filtering', 'facet', 'range', 'date'],
  },
  {
    to: '/tables/selection',
    labelKey: 'nav.tables.selection',
    keywords: ['tables', 'selection', 'select', 'rows', 'bulk'],
  },
  {
    to: '/tables/columns',
    labelKey: 'nav.tables.columns',
    keywords: ['tables', 'columns', 'visibility', 'pin', 'pinning'],
  },
  {
    to: '/tables/sub-rows',
    labelKey: 'nav.tables.subRows',
    keywords: ['tables', 'expand', 'tree', 'sub-rows', 'nested'],
  },
  {
    to: '/tables/actions',
    labelKey: 'nav.tables.actions',
    keywords: ['tables', 'actions', 'row menu', 'dropdown', 'context menu'],
  },
  {
    to: '/tables/states',
    labelKey: 'nav.tables.states',
    keywords: ['tables', 'loading', 'empty', 'error', 'density'],
  },
  {
    to: '/tree',
    labelKey: 'commandPalette.cmd.treeViewLabel',
    keywords: ['tree', 'folder', 'explorer', 'nav'],
  },
  {
    to: '/timeline',
    labelKey: 'nav.timeline',
    keywords: ['activity', 'feed', 'audit', 'log', 'history'],
  },
  { to: '/charts', labelKey: 'nav.charts', keywords: ['line', 'bar', 'pie', 'recharts'] },
  {
    to: '/positioning',
    labelKey: 'nav.positioning',
    keywords: ['flip', 'shift', 'boundary', 'tooltip'],
  },
  {
    to: '/layout',
    labelKey: 'commandPalette.cmd.layoutDemoLabel',
    keywords: ['sidebar', 'topbar', 'shell'],
  },
  {
    to: '/split',
    labelKey: 'commandPalette.cmd.splitLayoutLabel',
    keywords: ['inbox', 'master', 'detail', 'pane', 'resize'],
  },
  {
    to: '/focus',
    labelKey: 'commandPalette.cmd.focusModeLabel',
    keywords: ['fullscreen', 'editor', 'distraction'],
  },
  {
    to: '/kanban',
    labelKey: 'nav.kanban',
    keywords: ['kanban', 'board', 'drag', 'drop', 'dnd', 'tasks'],
  },
  {
    to: '/files',
    labelKey: 'nav.fileExplorer',
    keywords: ['files', 'folder', 'tree', 'explorer', 'finder'],
  },
  {
    to: '/gallery',
    labelKey: 'commandPalette.cmd.imageGalleryLabel',
    keywords: ['gallery', 'images', 'lightbox', 'photos', 'media'],
  },
  {
    to: '/search',
    labelKey: 'commandPalette.cmd.searchFiltersLabel',
    keywords: ['search', 'filter', 'chips', 'query', 'facets'],
  },
  {
    to: '/mobile-preview',
    labelKey: 'commandPalette.cmd.mobilePreviewLabel',
    keywords: ['mobile', 'bottom-sheet', 'touch', 'swipe', 'responsive'],
  },
  {
    to: '/new-components',
    labelKey: 'nav.newComponents',
    keywords: ['carousel', 'accordion', 'repeater', 'statcard', 'sticky'],
  },
  {
    to: '/dropzone',
    labelKey: 'nav.dropzone',
    keywords: ['dropzone', 'upload', 'file', 'drag', 'drop', 'attach', 'attachment'],
  },
  {
    to: '/motion',
    labelKey: 'nav.motion',
    keywords: [
      'motion',
      'animation',
      'animate',
      'fade',
      'slide',
      'bounce',
      'scale',
      'rotate',
      'flip',
      'stagger',
      'transition',
      'pulse',
      'shimmer',
      'marquee',
    ],
  },
  {
    to: '/playground',
    labelKey: 'nav.playground',
    keywords: ['playground', 'props', 'controls', 'sandbox', 'tweak'],
  },
  {
    to: '/settings/theme',
    labelKey: 'nav.themeEditor',
    keywords: ['theme', 'palette', 'colors', 'tokens', 'customize'],
  },
  {
    to: '/settings/typography',
    labelKey: 'commandPalette.cmd.typographyEditorLabel',
    keywords: ['typography', 'font', 'family', 'size', 'scale'],
  },
  {
    to: '/workspace',
    labelKey: 'nav.workspace',
    keywords: ['canvas', 'panels', 'editor', 'design'],
  },
  {
    to: '/errors',
    labelKey: 'commandPalette.cmd.errorBoundariesLabel',
    keywords: ['error', 'boundary', 'crash', 'fallback'],
  },
  {
    to: '/croissant/bakery-dashboard',
    labelKey: 'nav.croissant.bakeryDashboard',
    keywords: ['croissant', 'bakery', 'dashboard', 'kpi', 'stats', 'overview'],
  },
  {
    to: '/croissant/cards-and-people',
    labelKey: 'nav.croissant.cardsAndPeople',
    keywords: ['croissant', 'card', 'badge', 'avatar', 'people', 'team', 'roster', 'chip'],
  },
  {
    to: '/croissant/forms-bakery',
    labelKey: 'nav.croissant.formsBakery',
    keywords: ['croissant', 'form', 'order', 'rhf', 'zod', 'input', 'combobox', 'wizard'],
  },
  {
    to: '/croissant/feedback-theater',
    labelKey: 'nav.croissant.feedbackTheater',
    keywords: ['croissant', 'feedback', 'dialog', 'drawer', 'toast', 'alert', 'overlay', 'modal'],
  },
  {
    to: '/croissant/data-lab',
    labelKey: 'nav.croissant.dataLab',
    keywords: ['croissant', 'data', 'datatable', 'inventory', 'filter', 'pagination', 'sort'],
  },
  {
    to: '/croissant/navigation-trail',
    labelKey: 'nav.croissant.navigationTrail',
    keywords: [
      'croissant',
      'navigation',
      'breadcrumbs',
      'tabs',
      'stepper',
      'menu',
      'pagination',
      'accordion',
    ],
  },
  {
    to: '/croissant/timeline-and-activity',
    labelKey: 'nav.croissant.timelineActivity',
    keywords: ['croissant', 'timeline', 'activity', 'audit', 'history', 'feed', 'comments'],
  },
];

function RootShell() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { togglePalette, openPalette } = useCommandRegistry();
  const { t, i18n } = useTranslation();

  // Cmd/Ctrl+K toggles, "/" opens (when not typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K';
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        togglePalette();
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true) {
          return;
        }
        e.preventDefault();
        openPalette();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePalette, openPalette]);

  useRegisterCommands(
    [
      ...NAV_COMMANDS.map((nav) => ({
        id: `nav:${nav.to}`,
        label: t('commandPalette.goTo', { label: t(nav.labelKey) }),
        group: t('commandPalette.groups.navigation'),
        keywords: ['navigate', ...nav.keywords],
        perform: () => navigate(nav.to),
      })),
      {
        id: 'theme:light',
        label: t('commandPalette.cmd.themeLight'),
        group: t('commandPalette.groups.theme'),
        keywords: ['light', 'day'],
        disabled: theme === 'light',
        perform: () => setTheme('light'),
      },
      {
        id: 'theme:dark',
        label: t('commandPalette.cmd.themeDark'),
        group: t('commandPalette.groups.theme'),
        keywords: ['dark', 'night'],
        disabled: theme === 'dark',
        perform: () => setTheme('dark'),
      },
      {
        id: 'theme:system',
        label: t('commandPalette.cmd.themeSystem'),
        group: t('commandPalette.groups.theme'),
        keywords: ['auto', 'system', 'os'],
        disabled: theme === 'system',
        perform: () => setTheme('system'),
      },
      {
        id: 'palette:open',
        label: t('commandPalette.cmd.openPalette'),
        group: t('commandPalette.groups.actions'),
        keywords: ['search', 'find', 'commands'],
        shortcut: ['⌘', 'K'],
        perform: () => openPalette(),
      },
    ],
    [navigate, theme, setTheme, openPalette, t, i18n.language],
  );

  return (
    <>
      <ErrorBridge />
      <CommandPalette />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootShell />,
    errorElement: <RootRouterErrorElement />,
    children: [
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/auth/verify',
        element: <VerifyPage />,
      },
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/showcase" replace /> },
          { path: 'showcase', element: <ShowcasePage /> },
          { path: 'primitives', element: <PrimitivesPage /> },
          {
            path: 'forms',
            element: <FormsLayout />,
            children: [
              { index: true, element: <FormsOverviewPage /> },
              { path: 'fields', element: <FormFieldsPage /> },
              { path: 'layouts', element: <FormLayoutsPage /> },
              { path: 'validation', element: <FormValidationPage /> },
              { path: 'cards', element: <FormCardsPage /> },
              { path: 'tables', element: <FormTablesPage /> },
              { path: 'multi-step', element: <FormMultiStepPage /> },
              { path: 'repeater', element: <FormRepeaterPage /> },
              { path: 'async', element: <FormAsyncPage /> },
            ],
          },
          { path: 'wizard', element: <Navigate to="/forms/multi-step" replace /> },
          { path: 'repeater', element: <Navigate to="/forms/repeater" replace /> },
          { path: 'feedback', element: <FeedbackPage /> },
          { path: 'errors', element: <ErrorsDemoPage /> },
          {
            path: 'data',
            element: (
              <ProtectedRoute>
                <DataPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'tables',
            lazy: async () => {
              const { TablesLayout } = await import('@/pages/demos/tables');
              return {
                Component: () => (
                  <ProtectedRoute>
                    <TablesLayout />
                  </ProtectedRoute>
                ),
              };
            },
            errorElement: <RouterErrorElement source="route:/tables" />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { TablesOverviewPage } = await import('@/pages/demos/tables');
                  return { Component: TablesOverviewPage };
                },
              },
              {
                path: 'styles',
                lazy: async () => {
                  const { TableStylesPage } = await import('@/pages/demos/tables');
                  return { Component: TableStylesPage };
                },
              },
              {
                path: 'sorting',
                lazy: async () => {
                  const { TableSortingPage } = await import('@/pages/demos/tables');
                  return { Component: TableSortingPage };
                },
              },
              {
                path: 'filtering',
                lazy: async () => {
                  const { TableFilteringPage } = await import('@/pages/demos/tables');
                  return { Component: TableFilteringPage };
                },
              },
              {
                path: 'selection',
                lazy: async () => {
                  const { TableSelectionPage } = await import('@/pages/demos/tables');
                  return { Component: TableSelectionPage };
                },
              },
              {
                path: 'columns',
                lazy: async () => {
                  const { TableColumnsPage } = await import('@/pages/demos/tables');
                  return { Component: TableColumnsPage };
                },
              },
              {
                path: 'sub-rows',
                lazy: async () => {
                  const { TableSubRowsPage } = await import('@/pages/demos/tables');
                  return { Component: TableSubRowsPage };
                },
              },
              {
                path: 'actions',
                lazy: async () => {
                  const { TableActionsPage } = await import('@/pages/demos/tables');
                  return { Component: TableActionsPage };
                },
              },
              {
                path: 'states',
                lazy: async () => {
                  const { TableStatesPage } = await import('@/pages/demos/tables');
                  return { Component: TableStatesPage };
                },
              },
            ],
          },
          { path: 'positioning', element: <PositioningPage /> },
          { path: 'tree', element: <TreePage /> },
          { path: 'timeline', element: <TimelinePage /> },
          {
            path: 'charts',
            lazy: async () => {
              const { ChartsPage } = await import('@/pages/demos/charts');
              return { Component: ChartsPage };
            },
            errorElement: <RouterErrorElement source="route:/charts" />,
          },
          { path: 'split', element: <SplitDemoPage /> },
          { path: 'print-preview', element: <PrintPreviewPage /> },
          { path: 'focus', element: <FocusDemoPage /> },
          { path: 'dnd-sandbox', element: <DragDropSandboxPage /> },
          { path: 'kanban', element: <KanbanPage /> },
          { path: 'files', element: <FileExplorerPage /> },
          { path: 'gallery', element: <GalleryPage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'mobile-preview', element: <MobilePreviewPage /> },
          { path: 'new-components', element: <NewComponentsPage /> },
          { path: 'motion', element: <MotionPage /> },
          { path: 'dropzone', element: <DropzonePage /> },
          { path: 'playground', element: <PlaygroundPage /> },
          { path: 'settings/theme', element: <ThemeEditorPage /> },
          { path: 'settings/typography', element: <TypographyEditorPage /> },
          { path: 'croissant', element: <Navigate to="/croissant/bakery-dashboard" replace /> },
          { path: 'croissant/bakery-dashboard', element: <BakeryDashboardPage /> },
          { path: 'croissant/cards-and-people', element: <CardsAndPeoplePage /> },
          { path: 'croissant/forms-bakery', element: <FormsBakeryPage /> },
          { path: 'croissant/feedback-theater', element: <FeedbackTheaterPage /> },
          { path: 'croissant/data-lab', element: <DataLabPage /> },
          { path: 'croissant/navigation-trail', element: <NavigationTrailPage /> },
          { path: 'croissant/timeline-and-activity', element: <TimelineActivityPage /> },
          {
            path: 'workspace',
            lazy: async () => {
              const { WorkspaceDemoPage } = await import('@/pages/demos/workspace');
              return { Component: WorkspaceDemoPage };
            },
          },
          {
            path: 'admin',
            lazy: async () => {
              const { AdminPage } = await import('@/pages/admin');
              return {
                Component: () => (
                  <ProtectedRoute>
                    <RoleGate
                      roles={['admin']}
                      fallback={
                        <div className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                          You do not have permission to view this page.
                        </div>
                      }
                    >
                      <AdminPage />
                    </RoleGate>
                  </ProtectedRoute>
                ),
              };
            },
            errorElement: <RouterErrorElement source="route:/admin" />,
          },
        ],
      },
      // /layout demo uses its own PageShell (replaces AppLayout chrome).
      {
        path: '/layout',
        element: (
          <ProtectedRoute>
            <LayoutDemo />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      // SIMS uses its own SimsLayout shell (replaces AppLayout chrome).
      {
        path: '/sims',
        element: <SimsLayout />,
        children: [
          { index: true, element: <Navigate to="/sims/dashboard" replace /> },
          { path: 'dashboard', element: <SimsDashboardPage /> },
          { path: 'administration', element: <Navigate to="/sims/administration/users" replace /> },
          { path: 'administration/users', element: <SimsUsersPage /> },
          { path: 'administration/roles', element: <SimsRolesPage /> },
          { path: 'administration/modules', element: <SimsModulesPage /> },
          { path: 'administration/menu', element: <SimsMenuPage /> },
          { path: 'administration/holidays', element: <SimsHolidaysPage /> },
          { path: 'administration/email-configuration', element: <SimsEmailConfigPage /> },
          { path: 'administration/notifications', element: <SimsNotificationsPage /> },
          { path: 'administration/reports', element: <SimsReportsPage /> },
          { path: 'administration/statistics', element: <SimsStatisticsPage /> },
          { path: 'administration/logs', element: <SimsLogsPage /> },
          { path: 'administration/lookup-tables', element: <SimsLookupTablesPage /> },
          { path: 'administration/theme-configuration', element: <SimsThemeConfigPage /> },
          { path: 'administration/schema-drift', element: <SimsSchemaDriftPage /> },
        ],
      },
    ],
  },
]);

export function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryProvider>
          <AuthProvider>
            <ApiAuthBridge />
            <NotificationsProvider>
              <CommandRegistryProvider>
                <ToastProvider position="top-right">
                  <TooltipProvider delayDuration={300}>
                    <RouterProvider router={router} />
                  </TooltipProvider>
                </ToastProvider>
              </CommandRegistryProvider>
            </NotificationsProvider>
          </AuthProvider>
        </QueryProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
