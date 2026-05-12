import {
  FormInput,
  LayoutDashboard,
  MessageSquareWarning,
  PanelsTopLeft,
  Sparkles,
  Table,
} from 'lucide-react';
import type { ShowcaseEntry } from './model';

export const ENTRIES: ReadonlyArray<ShowcaseEntry> = [
  {
    to: '/primitives',
    label: 'Primitives',
    description: 'Button, IconButton, Badge, Avatar, Spinner, Skeleton, Kbd, Separator.',
    icon: <Sparkles className="h-5 w-5" />,
    count: '8 components',
  },
  {
    to: '/forms',
    label: 'Forms',
    description: 'Inputs, Select, Checkbox, Radio, Switch, FormField, react-hook-form + zod.',
    icon: <FormInput className="h-5 w-5" />,
    count: '10 components',
  },
  {
    to: '/feedback',
    label: 'Feedback',
    description: 'Alert, Toast, Tooltip, Dialog, Drawer, ConfirmDialog, Progress.',
    icon: <MessageSquareWarning className="h-5 w-5" />,
    count: '7 components',
  },
  {
    to: '/data',
    label: 'Data display',
    description: 'Card, Stat, List, EmptyState — dashboard-style readouts.',
    icon: <LayoutDashboard className="h-5 w-5" />,
    count: '4 components',
  },
  {
    to: '/tables',
    label: 'Tables',
    description: 'Static Table primitive plus headless DataTable on @tanstack/react-table.',
    icon: <Table className="h-5 w-5" />,
    count: '2 components',
  },
  {
    to: '/layout',
    label: 'Layout demo',
    description: 'Container, PageShell, PageHeader, Sidebar, Topbar plus Tabs, Breadcrumbs, Pagination, Stepper.',
    icon: <PanelsTopLeft className="h-5 w-5" />,
    count: 'Full app chrome',
  },
];
