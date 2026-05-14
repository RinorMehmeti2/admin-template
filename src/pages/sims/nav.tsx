import {
  AlertCircle,
  ArrowDownAZ,
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleMinus,
  CirclePlus,
  ClipboardList,
  Compass,
  FileText,
  GitCompare,
  Group,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Lock,
  Mail,
  MailSearch,
  Menu as MenuIcon,
  Palette,
  PanelLeft,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Table2,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface SimsNavLeaf {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

export interface SimsNavGroup {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: ReadonlyArray<SimsNavLeaf>;
}

export type SimsNavEntry = ({ kind: 'link' } & SimsNavLeaf) | ({ kind: 'group' } & SimsNavGroup);

export const SIMS_NAV: ReadonlyArray<SimsNavEntry> = [
  {
    kind: 'link',
    to: '/sims/dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboard,
  },
  {
    kind: 'group',
    id: 'administration',
    label: 'Administration',
    Icon: Shield,
    defaultOpen: true,
    children: [
      { to: '/sims/administration/users', label: 'Users', Icon: UsersRound },
      { to: '/sims/administration/roles', label: 'Roles', Icon: ShieldCheck },
      { to: '/sims/administration/modules', label: 'Modules & Operations', Icon: LayoutGrid },
      { to: '/sims/administration/menu', label: 'Menu', Icon: MenuIcon },
      { to: '/sims/administration/holidays', label: 'Holidays', Icon: Calendar },
      { to: '/sims/administration/email-configuration', label: 'Email Configuration', Icon: Mail },
      { to: '/sims/administration/notifications', label: 'Notifications', Icon: Bell },
      { to: '/sims/administration/reports', label: 'Reports', Icon: FileText },
      { to: '/sims/administration/statistics', label: 'Statistics', Icon: BarChart3 },
      { to: '/sims/administration/logs', label: 'Logs', Icon: ScrollText },
      { to: '/sims/administration/lookup-tables', label: 'Lookup Tables', Icon: Table2 },
      {
        to: '/sims/administration/theme-configuration',
        label: 'Theme Configuration',
        Icon: Palette,
      },
      { to: '/sims/administration/schema-drift', label: 'Schema Drift', Icon: GitCompare },
    ],
  },
];

// Breadcrumb mapping for sticky strip.
export const SIMS_BREADCRUMBS: Record<string, string[]> = {
  '/sims/dashboard': ['Home', 'Dashboard'],
  '/sims/administration/users': ['Administration', 'Users'],
  '/sims/administration/roles': ['Administration', 'Roles'],
  '/sims/administration/modules': ['Administration', 'Modules & Operations'],
  '/sims/administration/menu': ['Administration', 'Menu'],
  '/sims/administration/holidays': ['Administration', 'Holidays'],
  '/sims/administration/email-configuration': ['Administration', 'Email Configuration'],
  '/sims/administration/notifications': ['Administration', 'Notifications'],
  '/sims/administration/reports': ['Administration', 'Reports'],
  '/sims/administration/statistics': ['Administration', 'Statistics'],
  '/sims/administration/logs': ['Administration', 'Logs'],
  '/sims/administration/lookup-tables': ['Administration', 'Lookup Tables'],
  '/sims/administration/theme-configuration': ['Administration', 'Theme Configuration'],
  '/sims/administration/schema-drift': ['Administration', 'Schema Drift'],
};

// Map MOCK_NOTIFS iconKey → lucide component.
export const NOTIF_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'user-plus': UserPlus,
  'alert-triangle': AlertCircle,
  calendar: CalendarDays,
  mail: Mail,
  'file-text': FileText,
};

// Map drift state → icon + tone (used by SchemaDriftPage).
export const DRIFT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  match: CircleCheck,
  mismatch: CircleAlert,
  missing: CircleMinus,
  extra: CirclePlus,
};

// Map menu node iconKey → lucide (MenuPage preview + manage).
export const MENU_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'layout-dashboard': LayoutDashboard,
  'graduation-cap': UsersRound,
  school: Group,
  'book-open': Inbox,
  'check-square': CheckCircle2,
  'users-round': UsersRound,
  user: UsersRound,
  badge: ShieldCheck,
  heart: ClipboardList,
  wallet: ListChecks,
  'file-text': FileText,
};

// Convenience re-exports for pages.
export { ChevronRight, Compass, PanelLeft, Settings, Lock, ArrowDownAZ, MailSearch };
