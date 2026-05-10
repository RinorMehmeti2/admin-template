import type { ReactNode } from 'react';

export interface TreeNode<T = unknown> {
  id: string;
  label: string;
  children?: TreeNode<T>[];
  data?: T;
  disabled?: boolean;
  /**
   * If true, render a spinner next to the disclosure while children resolve.
   */
  isLoading?: boolean;
  /**
   * Force leaf/folder semantics regardless of `children`.
   * - true: treat as leaf even if `children` is set.
   * - false: treat as a folder even with no `children` yet (lets a caller
   *   show an unloaded folder that triggers `onLoadChildren` on expand).
   * Omit to derive from `children`.
   */
  isLeaf?: boolean;
}

export type TreeSelectionMode = 'none' | 'single' | 'multiple';

export interface TreeRenderItemContext<T = unknown> {
  node: TreeNode<T>;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isIndeterminate: boolean;
  isFocused: boolean;
  hasChildren: boolean;
  isLoading: boolean;
  toggleExpanded: () => void;
  toggleSelected: () => void;
}

export type TreeRenderItem<T = unknown> = (ctx: TreeRenderItemContext<T>) => ReactNode;
