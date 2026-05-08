import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  FormInput,
  LayoutDashboard,
  MessageSquareWarning,
  PanelsTopLeft,
  Sparkles,
  Table,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display';
import { Badge } from '@/components/primitives/Badge';
import { Kbd } from '@/components/primitives/Kbd';
import { useCommandRegistry } from '@/components/overlays/CommandPalette';

interface ShowcaseEntry {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  count: string;
}

const ENTRIES: ReadonlyArray<ShowcaseEntry> = [
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

export function ShowcasePage() {
  const { openPalette } = useCommandRegistry();
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="flex flex-col gap-3">
        <Badge variant="primary" size="sm" className="self-start">
          Admin UI Template
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          A fully owned component library for internal admin tools.
        </h1>
        <p className="max-w-2xl text-foreground-muted">
          Every primitive is built from scratch on React 19, Tailwind v4, and our own
          behavioral hooks — no headless library, no UI kit. Browse a category to see the
          pieces in action.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
          <button
            type="button"
            onClick={openPalette}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-foreground-muted shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span>Search commands</span>
            <span className="flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
        </div>
      </header>

      <section
        aria-label="Component categories"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {ENTRIES.map((entry) => (
          <Link
            key={entry.to}
            to={entry.to}
            className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card
              variant="outlined"
              className="h-full transition-colors group-hover:border-border-strong group-hover:bg-surface-muted/40"
            >
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-foreground">
                    {entry.icon}
                  </span>
                  <div>
                    <CardTitle className="text-base">{entry.label}</CardTitle>
                    <span className="text-xs text-foreground-subtle">{entry.count}</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-foreground-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>{entry.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <footer className="flex items-center justify-between border-t border-border pt-6 text-sm text-foreground-muted">
        <span>Press <Kbd>⌘</Kbd>+<Kbd>K</Kbd> anywhere to open the command palette.</span>
        <Link
          to="/primitives"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Start exploring
          <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </div>
  );
}
