import type { FileNode } from '@/components/data-display/FileExplorer';

/*
 * Small in-memory filesystem used by /files demo and stories.
 *
 * Tree shape:
 *   Workspace
 *   ├── src
 *   │   ├── components
 *   │   ├── hooks
 *   │   ├── pages
 *   │   ├── App.tsx
 *   │   └── main.tsx
 *   ├── docs
 *   ├── public
 *   │   └── images   (lazy — loads on demand)
 *   ├── archive      (lazy)
 *   ├── empty
 *   ├── package.json
 *   └── tsconfig.json
 *
 * `public/images` and `archive` start without `children`, demonstrating
 * the lazy-load flow. `mockLoadChildren(node)` resolves what would have
 * been the contents in a real fetch.
 */

export const mockFsRoot: FileNode = {
  id: 'root',
  name: 'Workspace',
  kind: 'folder',
  modifiedAt: new Date('2026-05-10'),
  children: [
    {
      id: 'src',
      name: 'src',
      kind: 'folder',
      modifiedAt: new Date('2026-05-09'),
      children: [
        {
          id: 'src/components',
          name: 'components',
          kind: 'folder',
          modifiedAt: new Date('2026-05-09'),
          children: [
            {
              id: 'src/components/Button.tsx',
              name: 'Button.tsx',
              kind: 'file',
              size: 2400,
              modifiedAt: new Date('2026-05-02'),
              mime: 'application/typescript',
            },
            {
              id: 'src/components/Card.tsx',
              name: 'Card.tsx',
              kind: 'file',
              size: 1800,
              modifiedAt: new Date('2026-04-30'),
              mime: 'application/typescript',
            },
            {
              id: 'src/components/Dialog.tsx',
              name: 'Dialog.tsx',
              kind: 'file',
              size: 5600,
              modifiedAt: new Date('2026-05-07'),
              mime: 'application/typescript',
            },
            {
              id: 'src/components/TreeView.tsx',
              name: 'TreeView.tsx',
              kind: 'file',
              size: 8200,
              modifiedAt: new Date('2026-05-09'),
              mime: 'application/typescript',
            },
            {
              id: 'src/components/Kanban.tsx',
              name: 'Kanban.tsx',
              kind: 'file',
              size: 9100,
              modifiedAt: new Date('2026-05-08'),
              mime: 'application/typescript',
            },
          ],
        },
        {
          id: 'src/hooks',
          name: 'hooks',
          kind: 'folder',
          modifiedAt: new Date('2026-04-22'),
          children: [
            {
              id: 'src/hooks/useDisclosure.ts',
              name: 'useDisclosure.ts',
              kind: 'file',
              size: 400,
              modifiedAt: new Date('2026-03-11'),
              mime: 'application/typescript',
            },
            {
              id: 'src/hooks/useFocusTrap.ts',
              name: 'useFocusTrap.ts',
              kind: 'file',
              size: 1900,
              modifiedAt: new Date('2026-04-01'),
              mime: 'application/typescript',
            },
            {
              id: 'src/hooks/usePosition.ts',
              name: 'usePosition.ts',
              kind: 'file',
              size: 7300,
              modifiedAt: new Date('2026-04-22'),
              mime: 'application/typescript',
            },
          ],
        },
        {
          id: 'src/pages',
          name: 'pages',
          kind: 'folder',
          modifiedAt: new Date('2026-05-09'),
          children: [
            {
              id: 'src/pages/HomePage.tsx',
              name: 'HomePage.tsx',
              kind: 'file',
              size: 1200,
              modifiedAt: new Date('2026-04-18'),
              mime: 'application/typescript',
            },
            {
              id: 'src/pages/SettingsPage.tsx',
              name: 'SettingsPage.tsx',
              kind: 'file',
              size: 3400,
              modifiedAt: new Date('2026-05-01'),
              mime: 'application/typescript',
            },
          ],
        },
        {
          id: 'src/App.tsx',
          name: 'App.tsx',
          kind: 'file',
          size: 6400,
          modifiedAt: new Date('2026-05-10'),
          mime: 'application/typescript',
        },
        {
          id: 'src/main.tsx',
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
          id: 'docs/README.md',
          name: 'README.md',
          kind: 'file',
          size: 4096,
          modifiedAt: new Date('2026-05-01'),
          mime: 'text/markdown',
        },
        {
          id: 'docs/CONTRIBUTING.md',
          name: 'CONTRIBUTING.md',
          kind: 'file',
          size: 7800,
          modifiedAt: new Date('2026-04-12'),
          mime: 'text/markdown',
        },
        {
          id: 'docs/CHANGELOG.md',
          name: 'CHANGELOG.md',
          kind: 'file',
          size: 12_500,
          modifiedAt: new Date('2026-05-09'),
          mime: 'text/markdown',
        },
      ],
    },
    {
      id: 'public',
      name: 'public',
      kind: 'folder',
      modifiedAt: new Date('2026-02-18'),
      children: [
        // Lazy folder — no `children` until loaded.
        { id: 'public/images', name: 'images', kind: 'folder' },
        {
          id: 'public/favicon.ico',
          name: 'favicon.ico',
          kind: 'file',
          size: 4286,
          modifiedAt: new Date('2025-11-04'),
          mime: 'image/x-icon',
        },
      ],
    },
    // Lazy top-level folder.
    { id: 'archive', name: 'archive', kind: 'folder' },
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
    {
      id: 'tsconfig.json',
      name: 'tsconfig.json',
      kind: 'file',
      size: 640,
      modifiedAt: new Date('2026-03-22'),
      mime: 'application/json',
    },
  ],
};

/** Resolved children for the two lazy folders. */
const LAZY_RESPONSES: Record<string, ReadonlyArray<FileNode>> = {
  'public/images': [
    {
      id: 'public/images/hero.jpg',
      name: 'hero.jpg',
      kind: 'file',
      size: 320_000,
      modifiedAt: new Date('2026-01-19'),
      mime: 'image/jpeg',
    },
    {
      id: 'public/images/logo.svg',
      name: 'logo.svg',
      kind: 'file',
      size: 2200,
      modifiedAt: new Date('2025-12-05'),
      mime: 'image/svg+xml',
    },
    {
      id: 'public/images/avatar-placeholder.png',
      name: 'avatar-placeholder.png',
      kind: 'file',
      size: 6400,
      modifiedAt: new Date('2026-02-18'),
      mime: 'image/png',
    },
  ],
  archive: [
    {
      id: 'archive/2024-q4.zip',
      name: '2024-q4.zip',
      kind: 'file',
      size: 4_200_000,
      modifiedAt: new Date('2025-01-12'),
      mime: 'application/zip',
    },
    {
      id: 'archive/2025-q1.zip',
      name: '2025-q1.zip',
      kind: 'file',
      size: 5_100_000,
      modifiedAt: new Date('2025-04-08'),
      mime: 'application/zip',
    },
  ],
};

export function mockLoadChildren(nodeId: string): ReadonlyArray<FileNode> | null {
  return LAZY_RESPONSES[nodeId] ?? null;
}

/**
 * Pure tree update: set `children` for the node with `targetId` to `value`.
 * Returns a new root (structurally shared above + below the target).
 */
export function setChildrenAt(
  root: FileNode,
  targetId: string,
  value: ReadonlyArray<FileNode> | 'pending',
): FileNode {
  if (root.id === targetId) {
    return { ...root, children: value };
  }
  if (!Array.isArray(root.children)) return root;
  return {
    ...root,
    children: root.children.map((c) => setChildrenAt(c, targetId, value)),
  };
}
