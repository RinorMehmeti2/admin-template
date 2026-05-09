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
import { TablesPage } from '@/pages/TablesPage';
import { PositioningPage } from '@/pages/PositioningPage';
import { ShowcasePage } from '@/pages/ShowcasePage';
import { DashboardPage, LayoutDemo, SettingsPage, UsersPage } from '@/pages/layout-demo';
import { ToastProvider } from '@/context/ToastProvider';
import { ThemeProvider, useTheme } from '@/context/ThemeProvider';
import { TooltipProvider } from '@/components/feedback/Tooltip';
import {
  CommandPalette,
  CommandRegistryProvider,
  useCommandRegistry,
  useRegisterCommands,
} from '@/components/overlays/CommandPalette';
import { AuthProvider, ProtectedRoute, PublicOnlyRoute, RoleGate } from '@/auth';
import { LoginPage } from '@/pages/auth/login';
import { AdminPage } from '@/pages/admin';

const NAV_COMMANDS: ReadonlyArray<{ to: string; label: string; keywords: string[] }> = [
  { to: '/showcase', label: 'Overview', keywords: ['home', 'index', 'showcase'] },
  { to: '/primitives', label: 'Primitives', keywords: ['button', 'badge', 'avatar'] },
  { to: '/forms', label: 'Forms', keywords: ['input', 'select', 'checkbox'] },
  { to: '/feedback', label: 'Feedback', keywords: ['toast', 'alert', 'dialog'] },
  { to: '/data', label: 'Data display', keywords: ['card', 'stat', 'list'] },
  { to: '/tables', label: 'Tables', keywords: ['datatable', 'rows'] },
  { to: '/positioning', label: 'Positioning', keywords: ['flip', 'shift', 'boundary', 'tooltip'] },
  { to: '/layout', label: 'Layout demo', keywords: ['sidebar', 'topbar', 'shell'] },
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
      <CommandPalette />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootShell />,
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
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/showcase" replace /> },
          { path: 'showcase', element: <ShowcasePage /> },
          { path: 'primitives', element: <PrimitivesPage /> },
          { path: 'forms', element: <FormsPage /> },
          { path: 'feedback', element: <FeedbackPage /> },
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
            element: (
              <ProtectedRoute>
                <TablesPage />
              </ProtectedRoute>
            ),
          },
          { path: 'positioning', element: <PositioningPage /> },
          {
            path: 'admin',
            element: (
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
      <AuthProvider>
        <CommandRegistryProvider>
          <ToastProvider position="top-right">
            <TooltipProvider delayDuration={300}>
              <RouterProvider router={router} />
            </TooltipProvider>
          </ToastProvider>
        </CommandRegistryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
