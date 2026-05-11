import { useState } from 'react';
import { Download, FolderInput, Pencil, Share2, Trash2 } from 'lucide-react';
import { FileExplorer } from './FileExplorer';
import type { FileExplorerAction, FileNode } from './FileExplorer.types';

export default { title: 'Data Display/FileExplorer', component: FileExplorer };

const ROOT: FileNode = {
  id: 'root',
  name: 'Workspace',
  kind: 'folder',
  children: [
    {
      id: 'src',
      name: 'src',
      kind: 'folder',
      modifiedAt: new Date('2026-04-12'),
      children: [
        {
          id: 'components',
          name: 'components',
          kind: 'folder',
          modifiedAt: new Date('2026-05-04'),
          children: [
            {
              id: 'Button.tsx',
              name: 'Button.tsx',
              kind: 'file',
              size: 2400,
              modifiedAt: new Date('2026-05-02'),
              mime: 'application/typescript',
            },
            {
              id: 'Card.tsx',
              name: 'Card.tsx',
              kind: 'file',
              size: 1800,
              modifiedAt: new Date('2026-04-30'),
              mime: 'application/typescript',
            },
            {
              id: 'Tree.tsx',
              name: 'TreeView.tsx',
              kind: 'file',
              size: 8200,
              modifiedAt: new Date('2026-05-09'),
              mime: 'application/typescript',
            },
          ],
        },
        {
          id: 'hooks',
          name: 'hooks',
          kind: 'folder',
          modifiedAt: new Date('2026-04-22'),
          children: [
            {
              id: 'useDisclosure.ts',
              name: 'useDisclosure.ts',
              kind: 'file',
              size: 400,
              modifiedAt: new Date('2026-03-11'),
              mime: 'application/typescript',
            },
            {
              id: 'useFocusTrap.ts',
              name: 'useFocusTrap.ts',
              kind: 'file',
              size: 1900,
              modifiedAt: new Date('2026-04-01'),
              mime: 'application/typescript',
            },
          ],
        },
        {
          id: 'main.tsx',
          name: 'main.tsx',
          kind: 'file',
          size: 320,
          modifiedAt: new Date('2026-04-08'),
          mime: 'application/typescript',
        },
      ],
    },
    {
      id: 'docs',
      name: 'docs',
      kind: 'folder',
      modifiedAt: new Date('2026-05-01'),
      children: [
        {
          id: 'README.md',
          name: 'README.md',
          kind: 'file',
          size: 4096,
          modifiedAt: new Date('2026-05-01'),
          mime: 'text/markdown',
        },
        {
          id: 'CONTRIBUTING.md',
          name: 'CONTRIBUTING.md',
          kind: 'file',
          size: 7800,
          modifiedAt: new Date('2026-04-12'),
          mime: 'text/markdown',
        },
      ],
    },
    {
      id: 'assets',
      name: 'assets',
      kind: 'folder',
      modifiedAt: new Date('2026-02-18'),
      children: [
        {
          id: 'logo.svg',
          name: 'logo.svg',
          kind: 'file',
          size: 2200,
          modifiedAt: new Date('2025-12-05'),
          mime: 'image/svg+xml',
        },
        {
          id: 'cover.jpg',
          name: 'cover.jpg',
          kind: 'file',
          size: 240_000,
          modifiedAt: new Date('2026-01-19'),
          mime: 'image/jpeg',
        },
      ],
    },
    {
      id: 'empty',
      name: 'empty',
      kind: 'folder',
      modifiedAt: new Date('2026-05-09'),
      children: [],
    },
    {
      id: 'package.json',
      name: 'package.json',
      kind: 'file',
      size: 1500,
      modifiedAt: new Date('2026-05-10'),
      mime: 'application/json',
    },
  ],
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-lg border border-border bg-background">
      {children}
    </div>
  );
}

export function Default() {
  const [action, setAction] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <Frame>
        <FileExplorer
          root={ROOT}
          onAction={(id, sel) => setAction(`${id} on ${sel.map((s) => s.name).join(', ')}`)}
        />
      </Frame>
      {action !== null ? (
        <p className="text-sm text-foreground-muted">Last action: {action}</p>
      ) : null}
    </div>
  );
}

export function ListViewOnly() {
  return (
    <Frame>
      <FileExplorer root={ROOT} viewMode="list" />
    </Frame>
  );
}

export function GridViewOnly() {
  return (
    <Frame>
      <FileExplorer root={ROOT} defaultViewMode="grid" />
    </Frame>
  );
}

export function CustomActions() {
  const actions: ReadonlyArray<FileExplorerAction> = [
    { id: 'open', label: 'Open' },
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
      disabled: (sel) => sel.length !== 1,
    },
    {
      id: 'move',
      label: 'Move',
      icon: <FolderInput className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'download',
      label: 'Download',
      icon: <Download className="h-4 w-4" aria-hidden="true" />,
      hidden: (sel) => sel.some((s) => s.kind === 'folder'),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 text-danger" aria-hidden="true" />,
      separatorBefore: true,
    },
  ];
  return (
    <Frame>
      <FileExplorer root={ROOT} actions={actions} defaultSelectedPath={['src']} />
    </Frame>
  );
}

export function DeepPath() {
  return (
    <Frame>
      <FileExplorer root={ROOT} defaultSelectedPath={['src', 'components']} />
    </Frame>
  );
}

export function LazyLoading() {
  const [root, setRoot] = useState<FileNode>({
    id: 'root',
    name: 'Remote drive',
    kind: 'folder',
    children: [
      { id: 'projects', name: 'projects', kind: 'folder' },
      { id: 'archive', name: 'archive', kind: 'folder' },
    ],
  });

  const loadChildren = (node: FileNode) => {
    // Mark as pending.
    setRoot((prev) => mutate(prev, node.id, () => 'pending'));
    // Fake fetch.
    setTimeout(() => {
      setRoot((prev) =>
        mutate(prev, node.id, () => [
          {
            id: `${node.id}/a`,
            name: 'alpha.txt',
            kind: 'file',
            size: 1024,
            modifiedAt: new Date(),
            mime: 'text/plain',
          },
          {
            id: `${node.id}/b`,
            name: 'beta.txt',
            kind: 'file',
            size: 2048,
            modifiedAt: new Date(),
            mime: 'text/plain',
          },
        ]),
      );
    }, 700);
  };

  return (
    <Frame>
      <FileExplorer root={root} onLoadChildren={loadChildren} />
    </Frame>
  );
}

function mutate(
  node: FileNode,
  targetId: string,
  setChildren: () => ReadonlyArray<FileNode> | 'pending',
): FileNode {
  if (node.id === targetId) {
    return { ...node, children: setChildren() };
  }
  if (!Array.isArray(node.children)) return node;
  return {
    ...node,
    children: node.children.map((c) => mutate(c, targetId, setChildren)),
  };
}
