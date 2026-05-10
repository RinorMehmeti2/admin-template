import { useMemo, useState, type ReactNode } from 'react';
import {
  ChevronRight,
  File,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
  Hash,
  LayoutDashboard,
  ListTree,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { TreeView } from './TreeView';
import type { TreeNode, TreeRenderItemContext } from './TreeView.types';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Spinner } from '@/components/primitives/Spinner';
import { cn } from '@/lib/cn';

export default { title: 'Data Display/TreeView', component: TreeView };

interface FileMeta {
  kind: 'folder' | 'tsx' | 'ts' | 'md' | 'json';
}

const FILE_TREE: TreeNode<FileMeta>[] = [
  {
    id: 'src',
    label: 'src',
    data: { kind: 'folder' },
    children: [
      {
        id: 'src/components',
        label: 'components',
        data: { kind: 'folder' },
        children: [
          {
            id: 'src/components/Button.tsx',
            label: 'Button.tsx',
            data: { kind: 'tsx' },
          },
          {
            id: 'src/components/Card.tsx',
            label: 'Card.tsx',
            data: { kind: 'tsx' },
          },
          {
            id: 'src/components/Dialog.tsx',
            label: 'Dialog.tsx',
            data: { kind: 'tsx' },
          },
        ],
      },
      {
        id: 'src/hooks',
        label: 'hooks',
        data: { kind: 'folder' },
        children: [
          {
            id: 'src/hooks/useDisclosure.ts',
            label: 'useDisclosure.ts',
            data: { kind: 'ts' },
          },
          {
            id: 'src/hooks/useFocusTrap.ts',
            label: 'useFocusTrap.ts',
            data: { kind: 'ts' },
          },
        ],
      },
      { id: 'src/main.tsx', label: 'main.tsx', data: { kind: 'tsx' } },
      { id: 'src/App.tsx', label: 'App.tsx', data: { kind: 'tsx' } },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    data: { kind: 'folder' },
    children: [
      { id: 'docs/README.md', label: 'README.md', data: { kind: 'md' } },
      { id: 'docs/CONTRIBUTING.md', label: 'CONTRIBUTING.md', data: { kind: 'md' } },
    ],
  },
  { id: 'package.json', label: 'package.json', data: { kind: 'json' } },
];

function FileIcon({ meta, isExpanded }: { meta: FileMeta | undefined; isExpanded: boolean }) {
  if (meta?.kind === 'folder') {
    return isExpanded ? (
      <FolderOpen className="h-4 w-4 text-warning" />
    ) : (
      <Folder className="h-4 w-4 text-warning" />
    );
  }
  if (meta?.kind === 'tsx' || meta?.kind === 'ts') {
    return <FileCode className="h-4 w-4 text-info" />;
  }
  if (meta?.kind === 'md') {
    return <FileText className="h-4 w-4 text-foreground-muted" />;
  }
  return <File className="h-4 w-4 text-foreground-muted" />;
}

function FileExplorerRow({ ctx }: { ctx: TreeRenderItemContext<FileMeta> }) {
  const { node, level, isExpanded, isSelected, isFocused, hasChildren, isLoading } = ctx;
  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors',
        'hover:bg-surface-muted',
        isSelected && 'bg-primary/10 text-foreground',
        isFocused && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
      )}
      style={{ paddingInlineStart: `${(level - 1) * 16 + 6}px` }}
    >
      {hasChildren && !isLoading ? (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-foreground-muted transition-transform',
            isExpanded && 'rotate-90',
          )}
        />
      ) : isLoading ? (
        <Spinner size="xs" />
      ) : (
        <span aria-hidden="true" className="inline-block h-3.5 w-3.5 shrink-0" />
      )}
      <FileIcon meta={node.data} isExpanded={isExpanded} />
      <span className="min-w-0 flex-1 truncate">{node.label}</span>
    </div>
  );
}

export const FileExplorer = {
  render: () => {
    function Demo() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <Card variant="outlined" className="max-w-md">
          <CardHeader>
            <CardTitle>File explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <TreeView<FileMeta>
              items={FILE_TREE}
              selectionMode="single"
              defaultExpandedIds={['src', 'src/components']}
              selectedIds={selected}
              onSelectedChange={setSelected}
              renderItem={(ctx) => <FileExplorerRow ctx={ctx} />}
              aria-label="Project files"
            />
            <p className="mt-3 text-xs text-foreground-muted">
              Selected: {selected.join(', ') || '—'}
            </p>
          </CardContent>
        </Card>
      );
    }
    return <Demo />;
  },
};

const NAV_TREE: TreeNode[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    children: [
      { id: 'workspace/dashboard', label: 'Dashboard' },
      { id: 'workspace/reports', label: 'Reports' },
      { id: 'workspace/insights', label: 'Insights' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    children: [
      { id: 'people/users', label: 'Users' },
      { id: 'people/roles', label: 'Roles' },
      { id: 'people/teams', label: 'Teams' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    children: [
      { id: 'security/audit-log', label: 'Audit log' },
      { id: 'security/sessions', label: 'Sessions' },
    ],
  },
];

const NAV_ICONS: Record<string, ReactNode> = {
  workspace: <LayoutDashboard className="h-4 w-4" />,
  people: <Users className="h-4 w-4" />,
  security: <ShieldCheck className="h-4 w-4" />,
  'workspace/dashboard': <LayoutDashboard className="h-4 w-4" />,
  'workspace/reports': <ListTree className="h-4 w-4" />,
  'workspace/insights': <Hash className="h-4 w-4" />,
  'people/users': <Users className="h-4 w-4" />,
  'people/roles': <ShieldCheck className="h-4 w-4" />,
  'people/teams': <Users className="h-4 w-4" />,
  'security/audit-log': <FileText className="h-4 w-4" />,
  'security/sessions': <Hash className="h-4 w-4" />,
};

export const NavigationTree = {
  render: () => {
    function Demo() {
      const [selected, setSelected] = useState<string[]>(['workspace/dashboard']);
      return (
        <Card variant="outlined" className="max-w-xs">
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <TreeView
              items={NAV_TREE}
              selectionMode="single"
              defaultExpandedIds={['workspace', 'people', 'security']}
              selectedIds={selected}
              onSelectedChange={setSelected}
              aria-label="Sections"
              renderItem={({ node, level, isSelected, isFocused, hasChildren, isExpanded }) => (
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
                    'hover:bg-surface-muted',
                    isSelected && 'bg-primary/15 text-primary',
                    isFocused && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
                  )}
                  style={{ paddingInlineStart: `${(level - 1) * 14 + 8}px` }}
                >
                  {hasChildren ? (
                    <ChevronRight
                      aria-hidden="true"
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 text-foreground-subtle transition-transform',
                        isExpanded && 'rotate-90',
                      )}
                    />
                  ) : (
                    <span className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="text-foreground-muted">{NAV_ICONS[node.id] ?? null}</span>
                  <span className="min-w-0 flex-1 truncate">{node.label}</span>
                </div>
              )}
            />
          </CardContent>
        </Card>
      );
    }
    return <Demo />;
  },
};

const PERMISSIONS_TREE: TreeNode[] = [
  {
    id: 'all',
    label: 'All permissions',
    children: [
      {
        id: 'billing',
        label: 'Billing',
        children: [
          { id: 'billing.view', label: 'View invoices' },
          { id: 'billing.edit', label: 'Edit invoices' },
          { id: 'billing.refund', label: 'Issue refunds' },
        ],
      },
      {
        id: 'users',
        label: 'Users',
        children: [
          { id: 'users.view', label: 'View users' },
          { id: 'users.invite', label: 'Invite users' },
          { id: 'users.delete', label: 'Delete users' },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        children: [
          { id: 'reports.view', label: 'View reports' },
          { id: 'reports.export', label: 'Export reports' },
        ],
      },
    ],
  },
];

export const MultiSelectCheckboxes = {
  render: () => {
    function Demo() {
      const [selected, setSelected] = useState<string[]>(['billing.view', 'users.view']);
      return (
        <Card variant="outlined" className="max-w-md">
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <TreeView
              items={PERMISSIONS_TREE}
              selectionMode="multiple"
              defaultExpandedIds={['all', 'billing', 'users', 'reports']}
              selectedIds={selected}
              onSelectedChange={setSelected}
              aria-label="Permissions"
            />
            <p className="mt-3 text-xs text-foreground-muted">{selected.length} selected</p>
          </CardContent>
        </Card>
      );
    }
    return <Demo />;
  },
};

const ASYNC_INITIAL: TreeNode[] = [
  { id: 'org', label: 'Organization', isLeaf: false },
  { id: 'projects', label: 'Projects', isLeaf: false },
  { id: 'archive', label: 'Archive', isLeaf: false },
];

const ASYNC_CHILDREN: Record<string, TreeNode[]> = {
  org: [
    { id: 'org/people', label: 'People' },
    { id: 'org/policies', label: 'Policies' },
  ],
  projects: [
    { id: 'projects/launchpad', label: 'Launchpad', isLeaf: false },
    { id: 'projects/orbit', label: 'Orbit' },
  ],
  archive: [{ id: 'archive/2024', label: '2024' }],
  'projects/launchpad': [
    { id: 'projects/launchpad/m1', label: 'Milestone 1' },
    { id: 'projects/launchpad/m2', label: 'Milestone 2' },
  ],
};

export const AsyncLoading = {
  render: () => {
    function Demo() {
      const [items, setItems] = useState<TreeNode[]>(ASYNC_INITIAL);

      const handleLoad = (node: TreeNode) => {
        const update = (list: TreeNode[]): TreeNode[] =>
          list.map((n) => {
            if (n.id === node.id) return { ...n, isLoading: true };
            if (Array.isArray(n.children)) return { ...n, children: update(n.children) };
            return n;
          });
        setItems(update);
        // simulate latency
        setTimeout(() => {
          const finish = (list: TreeNode[]): TreeNode[] =>
            list.map((n) => {
              if (n.id === node.id) {
                const { isLeaf: _drop, ...rest } = n;
                return {
                  ...rest,
                  isLoading: false,
                  children: ASYNC_CHILDREN[node.id] ?? [],
                };
              }
              if (Array.isArray(n.children)) return { ...n, children: finish(n.children) };
              return n;
            });
          setItems(finish);
        }, 700);
      };

      const ariaHelp = useMemo(() => 'Tree with on-demand children', []);
      return (
        <Card variant="outlined" className="max-w-md">
          <CardHeader>
            <CardTitle>Async-loaded children</CardTitle>
          </CardHeader>
          <CardContent>
            <TreeView
              items={items}
              selectionMode="single"
              onLoadChildren={handleLoad}
              aria-label={ariaHelp}
            />
            <p className="mt-3 text-xs text-foreground-muted">
              Folders without children loaded show a spinner while fetching.
            </p>
          </CardContent>
        </Card>
      );
    }
    return <Demo />;
  },
};

export const Disabled = {
  render: () => (
    <Card variant="outlined" className="max-w-md">
      <CardContent>
        <TreeView
          items={[
            {
              id: 'a',
              label: 'Active',
              children: [
                { id: 'a-1', label: 'Child 1' },
                { id: 'a-2', label: 'Child 2', disabled: true },
              ],
            },
            {
              id: 'b',
              label: 'Disabled folder',
              disabled: true,
              children: [{ id: 'b-1', label: 'Hidden' }],
            },
            { id: 'c', label: 'Plain leaf' },
          ]}
          selectionMode="single"
          defaultExpandedIds={['a']}
          aria-label="Disabled demo"
        />
      </CardContent>
    </Card>
  ),
};
