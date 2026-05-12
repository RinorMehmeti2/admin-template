import type { TreeNode } from '@/components/data-display/TreeView';
import type { FileMeta } from './model';

export const TREE: TreeNode<FileMeta>[] = [
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
