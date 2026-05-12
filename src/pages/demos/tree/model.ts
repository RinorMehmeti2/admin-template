import type { TreeNode } from '@/components/data-display/TreeView';

export interface FileMeta {
  kind: 'folder' | 'tsx' | 'ts' | 'md' | 'json' | 'css';
  size?: string;
}

export function meta(node: TreeNode<FileMeta>): FileMeta | undefined {
  return node.data;
}

export function findById(
  list: TreeNode<FileMeta>[],
  id: string,
): TreeNode<FileMeta> | undefined {
  for (const n of list) {
    if (n.id === id) return n;
    if (Array.isArray(n.children)) {
      const hit = findById(n.children, id);
      if (hit !== undefined) return hit;
    }
  }
  return undefined;
}
