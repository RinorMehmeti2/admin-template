import { useState } from 'react';
import { ChevronRight, File, FileCode, FileText, Folder, FolderOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { TreeView } from '@/components/data-display/TreeView';
import type { TreeNode, TreeRenderItemContext } from '@/components/data-display/TreeView';
import { Badge } from '@/components/primitives/Badge';
import { cn } from '@/lib/cn';

interface FileMeta {
  kind: 'folder' | 'tsx' | 'ts' | 'md' | 'json' | 'css';
  size?: string;
}

const TREE: TreeNode<FileMeta>[] = [
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
            id: 'src/components/primitives',
            label: 'primitives',
            data: { kind: 'folder' },
            children: [
              {
                id: 'src/components/primitives/Button.tsx',
                label: 'Button.tsx',
                data: { kind: 'tsx', size: '2.4 KB' },
              },
              {
                id: 'src/components/primitives/Avatar.tsx',
                label: 'Avatar.tsx',
                data: { kind: 'tsx', size: '1.1 KB' },
              },
              {
                id: 'src/components/primitives/Badge.tsx',
                label: 'Badge.tsx',
                data: { kind: 'tsx', size: '0.8 KB' },
              },
            ],
          },
          {
            id: 'src/components/data-display',
            label: 'data-display',
            data: { kind: 'folder' },
            children: [
              {
                id: 'src/components/data-display/Card.tsx',
                label: 'Card.tsx',
                data: { kind: 'tsx', size: '1.6 KB' },
              },
              {
                id: 'src/components/data-display/TreeView.tsx',
                label: 'TreeView.tsx',
                data: { kind: 'tsx', size: '8.2 KB' },
              },
            ],
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
            data: { kind: 'ts', size: '0.4 KB' },
          },
          {
            id: 'src/hooks/useFocusTrap.ts',
            label: 'useFocusTrap.ts',
            data: { kind: 'ts', size: '1.9 KB' },
          },
        ],
      },
      {
        id: 'src/styles',
        label: 'styles',
        data: { kind: 'folder' },
        children: [
          {
            id: 'src/styles/globals.css',
            label: 'globals.css',
            data: { kind: 'css', size: '0.5 KB' },
          },
          {
            id: 'src/styles/tokens.css',
            label: 'tokens.css',
            data: { kind: 'css', size: '3.7 KB' },
          },
        ],
      },
      { id: 'src/main.tsx', label: 'main.tsx', data: { kind: 'tsx', size: '0.3 KB' } },
      { id: 'src/App.tsx', label: 'App.tsx', data: { kind: 'tsx', size: '6.4 KB' } },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    data: { kind: 'folder' },
    children: [
      {
        id: 'docs/CONTRIBUTING.md',
        label: 'CONTRIBUTING.md',
        data: { kind: 'md', size: '4.1 KB' },
      },
      { id: 'docs/README.md', label: 'README.md', data: { kind: 'md', size: '2.0 KB' } },
    ],
  },
  { id: 'package.json', label: 'package.json', data: { kind: 'json', size: '1.5 KB' } },
  { id: 'tsconfig.json', label: 'tsconfig.json', data: { kind: 'json', size: '0.6 KB' } },
];

function meta(node: TreeNode<FileMeta>): FileMeta | undefined {
  return node.data;
}

function FileIcon({ kind, isExpanded }: { kind: FileMeta['kind']; isExpanded: boolean }) {
  if (kind === 'folder') {
    return isExpanded ? (
      <FolderOpen className="h-4 w-4 text-warning" />
    ) : (
      <Folder className="h-4 w-4 text-warning" />
    );
  }
  if (kind === 'tsx' || kind === 'ts') return <FileCode className="h-4 w-4 text-info" />;
  if (kind === 'md') return <FileText className="h-4 w-4 text-foreground-muted" />;
  if (kind === 'css') return <FileCode className="h-4 w-4 text-success" />;
  return <File className="h-4 w-4 text-foreground-muted" />;
}

function Row({ ctx }: { ctx: TreeRenderItemContext<FileMeta> }) {
  const { node, level, isExpanded, isSelected, isFocused, hasChildren } = ctx;
  const m = meta(node);
  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors',
        'hover:bg-surface-muted',
        isSelected && 'bg-primary/10',
        isFocused && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
      )}
      style={{ paddingInlineStart: `${(level - 1) * 16 + 6}px` }}
    >
      {hasChildren ? (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-foreground-muted transition-transform',
            isExpanded && 'rotate-90',
          )}
        />
      ) : (
        <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      )}
      <FileIcon kind={m?.kind ?? 'json'} isExpanded={isExpanded} />
      <span className="min-w-0 flex-1 truncate">{node.label}</span>
      {m?.size !== undefined ? (
        <span className="shrink-0 text-xs text-foreground-subtle">{m.size}</span>
      ) : null}
    </div>
  );
}

function findById(list: TreeNode<FileMeta>[], id: string): TreeNode<FileMeta> | undefined {
  for (const n of list) {
    if (n.id === id) return n;
    if (Array.isArray(n.children)) {
      const hit = findById(n.children, id);
      if (hit !== undefined) return hit;
    }
  }
  return undefined;
}

export function TreePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedNode = selected[0] !== undefined ? findById(TREE, selected[0]) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">TreeView</h1>
        <p className="mt-1 text-foreground-muted">
          File-explorer pattern. Use arrow keys to navigate, Enter to open, type to jump.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
        <Card variant="outlined" className="h-fit">
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>
              2 folders, {TREE.filter((n) => n.data?.kind !== 'folder').length} files at root
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreeView<FileMeta>
              items={TREE}
              selectionMode="single"
              defaultExpandedIds={['src', 'src/components']}
              selectedIds={selected}
              onSelectedChange={setSelected}
              renderItem={(ctx) => <Row ctx={ctx} />}
              aria-label="Project files"
            />
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>{selectedNode?.label ?? 'Nothing selected'}</CardTitle>
              <CardDescription>
                {selectedNode === undefined
                  ? 'Pick a file or folder from the tree to see details.'
                  : selectedNode.id}
              </CardDescription>
            </div>
            {selectedNode?.data?.kind !== undefined ? (
              <Badge variant="neutral" size="sm">
                {selectedNode.data.kind}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            {selectedNode === undefined ? (
              <p className="text-sm text-foreground-muted">
                Try keyboard nav: <kbd className="rounded bg-surface-muted px-1.5 py-0.5">↑</kbd>{' '}
                <kbd className="rounded bg-surface-muted px-1.5 py-0.5">↓</kbd>{' '}
                <kbd className="rounded bg-surface-muted px-1.5 py-0.5">→</kbd>{' '}
                <kbd className="rounded bg-surface-muted px-1.5 py-0.5">←</kbd>{' '}
                <kbd className="rounded bg-surface-muted px-1.5 py-0.5">Home</kbd>{' '}
                <kbd className="rounded bg-surface-muted px-1.5 py-0.5">End</kbd>{' '}
                <kbd className="rounded bg-surface-muted px-1.5 py-0.5">*</kbd>, or type a file
                name.
              </p>
            ) : (
              <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
                <dt className="text-foreground-muted">Path</dt>
                <dd className="font-mono text-xs">{selectedNode.id}</dd>
                <dt className="text-foreground-muted">Kind</dt>
                <dd>{selectedNode.data?.kind}</dd>
                {selectedNode.data?.size !== undefined ? (
                  <>
                    <dt className="text-foreground-muted">Size</dt>
                    <dd>{selectedNode.data.size}</dd>
                  </>
                ) : null}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
