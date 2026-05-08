import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrimitivesPage } from '@/pages/PrimitivesPage';
import { FormsPage } from '@/pages/FormsPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import {
  DashboardPage,
  LayoutDemo,
  SettingsPage,
  UsersPage,
} from '@/pages/layout-demo';
import { ToastProvider } from '@/context/ToastProvider';
import { TooltipProvider } from '@/components/feedback/Tooltip';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/primitives" replace /> },
      { path: 'primitives', element: <PrimitivesPage /> },
      { path: 'forms', element: <FormsPage /> },
      { path: 'feedback', element: <FeedbackPage /> },
    ],
  },
  // /layout demo uses its own PageShell (replaces AppLayout chrome).
  {
    path: '/layout',
    element: <LayoutDemo />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export function App() {
  return (
    <ToastProvider position="top-right">
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ToastProvider>
  );
}
