import { useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrimitivesPage } from '@/pages/PrimitivesPage';
import { FormsPage } from '@/pages/FormsPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { DataPage } from '@/pages/DataPage';
import { PositioningPage } from '@/pages/PositioningPage';
import { ShowcasePage } from '@/pages/ShowcasePage';
import { SplitDemoPage } from '@/pages/SplitDemoPage';
import { FocusDemoPage } from '@/pages/FocusDemoPage';
import { DashboardPage, LayoutDemo, SettingsPage, UsersPage } from '@/pages/layout-demo';
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
import { ErrorsDemoPage } from '@/pages/errors';
import { LoginPage } from '@/pages/auth/login';
import { VerifyPage } from '@/pages/auth/verify';
import { PrintPreviewPage } from '@/pages/PrintPreviewPage';
import { TreePage } from '@/pages/TreePage';
import { TimelinePage } from '@/pages/TimelinePage';
import { DragDropSandboxPage } from '@/pages/DragDropSandboxPage';
import { KanbanPage } from '@/pages/KanbanPage';
import { FileExplorerPage } from '@/pages/file-explorer';
import { GalleryPage } from '@/pages/GalleryPage';
import { WizardPage } from '@/pages/WizardPage';
import { SearchPage } from '@/pages/SearchPage';
import { MobilePreviewPage } from '@/pages/MobilePreviewPage';
import { PlaygroundPage } from '@/pages/playground';
import { ThemeEditorPage } from '@/pages/settings/theme';
import { TypographyEditorPage } from '@/pages/settings/typography';

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
 * RichTextEditor (TipTap + ProseMirror) is lazy-loaded *inside* FormsPage
 * via React.lazy + Suspense — see components/forms/RichTextEditor/lazy.tsx.
 */

const NAV_COMMANDS: ReadonlyArray<{ to: string; label: string; keywords: string[] }> = [
  { to: '/showcase', label: 'Overview', keywords: ['home', 'index', 'showcase'] },
  { to: '/primitives', label: 'Primitives', keywords: ['button', 'badge', 'avatar'] },
  { to: '/forms', label: 'Forms', keywords: ['input', 'select', 'checkbox'] },
  { to: '/feedback', label: 'Feedback', keywords: ['toast', 'alert', 'dialog'] },
  { to: '/data', label: 'Data display', keywords: ['card', 'stat', 'list'] },
  { to: '/tables', label: 'Tables', keywords: ['datatable', 'rows'] },
  { to: '/tree', label: 'Tree view', keywords: ['tree', 'folder', 'explorer', 'nav'] },
  {
    to: '/timeline',
    label: 'Timeline',
    keywords: ['activity', 'feed', 'audit', 'log', 'history'],
  },
  { to: '/charts', label: 'Charts', keywords: ['line', 'bar', 'pie', 'recharts'] },
  { to: '/positioning', label: 'Positioning', keywords: ['flip', 'shift', 'boundary', 'tooltip'] },
  { to: '/layout', label: 'Layout demo', keywords: ['sidebar', 'topbar', 'shell'] },
  {
    to: '/split',
    label: 'Split layout',
    keywords: ['inbox', 'master', 'detail', 'pane', 'resize'],
  },
  { to: '/focus', label: 'Focus mode', keywords: ['fullscreen', 'editor', 'distraction'] },
  {
    to: '/kanban',
    label: 'Kanban',
    keywords: ['kanban', 'board', 'drag', 'drop', 'dnd', 'tasks'],
  },
  {
    to: '/files',
    label: 'File explorer',
    keywords: ['files', 'folder', 'tree', 'explorer', 'finder'],
  },
  {
    to: '/gallery',
    label: 'Image gallery',
    keywords: ['gallery', 'images', 'lightbox', 'photos', 'media'],
  },
  {
    to: '/wizard',
    label: 'Form wizard',
    keywords: ['wizard', 'multistep', 'onboarding', 'form', 'stepper'],
  },
  {
    to: '/search',
    label: 'Search & filters',
    keywords: ['search', 'filter', 'chips', 'query', 'facets'],
  },
  {
    to: '/mobile-preview',
    label: 'Mobile preview',
    keywords: ['mobile', 'bottom-sheet', 'touch', 'swipe', 'responsive'],
  },
  {
    to: '/playground',
    label: 'Playground',
    keywords: ['playground', 'props', 'controls', 'sandbox', 'tweak'],
  },
  {
    to: '/settings/theme',
    label: 'Theme editor',
    keywords: ['theme', 'palette', 'colors', 'tokens', 'customize'],
  },
  {
    to: '/settings/typography',
    label: 'Typography editor',
    keywords: ['typography', 'font', 'family', 'size', 'scale'],
  },
  { to: '/workspace', label: 'Workspace', keywords: ['canvas', 'panels', 'editor', 'design'] },
  {
    to: '/errors',
    label: 'Error boundaries',
    keywords: ['error', 'boundary', 'crash', 'fallback'],
  },
];

function RootShell() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { togglePalette, openPalette } = useCommandRegistry();

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
        label: `Go to ${nav.label}`,
        group: 'Navigation',
        keywords: ['navigate', ...nav.keywords],
        perform: () => navigate(nav.to),
      })),
      {
        id: 'theme:light',
        label: 'Switch to light theme',
        group: 'Theme',
        keywords: ['light', 'day'],
        disabled: theme === 'light',
        perform: () => setTheme('light'),
      },
      {
        id: 'theme:dark',
        label: 'Switch to dark theme',
        group: 'Theme',
        keywords: ['dark', 'night'],
        disabled: theme === 'dark',
        perform: () => setTheme('dark'),
      },
      {
        id: 'theme:system',
        label: 'Match system theme',
        group: 'Theme',
        keywords: ['auto', 'system', 'os'],
        disabled: theme === 'system',
        perform: () => setTheme('system'),
      },
      {
        id: 'palette:open',
        label: 'Open command palette',
        group: 'Actions',
        keywords: ['search', 'find', 'commands'],
        shortcut: ['⌘', 'K'],
        perform: () => openPalette(),
      },
    ],
    [navigate, theme, setTheme, openPalette],
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
          { path: 'forms', element: <FormsPage /> },
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
              const { TablesPage } = await import('@/pages/TablesPage');
              return {
                Component: () => (
                  <ProtectedRoute>
                    <TablesPage />
                  </ProtectedRoute>
                ),
              };
            },
            errorElement: <RouterErrorElement source="route:/tables" />,
          },
          { path: 'positioning', element: <PositioningPage /> },
          { path: 'tree', element: <TreePage /> },
          { path: 'timeline', element: <TimelinePage /> },
          {
            path: 'charts',
            lazy: async () => {
              const { ChartsPage } = await import('@/pages/ChartsPage');
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
          { path: 'wizard', element: <WizardPage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'mobile-preview', element: <MobilePreviewPage /> },
          { path: 'playground', element: <PlaygroundPage /> },
          { path: 'settings/theme', element: <ThemeEditorPage /> },
          { path: 'settings/typography', element: <TypographyEditorPage /> },
          {
            path: 'workspace',
            lazy: async () => {
              const { WorkspaceDemoPage } = await import('@/pages/WorkspaceDemoPage');
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
