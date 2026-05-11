import type { ReactNode } from 'react';

/**
 * Filesystem node. Generic over `T extends FileNode` lets callers
 * attach extra fields (owner, permissions, etc.) while still being
 * accepted by `FileExplorer<T>`.
 *
 * `children`:
 *   - `undefined` → folder whose contents are not loaded yet. Tree
 *     expansion triggers `onLoadChildren(node)`.
 *   - `'pending'` → load in flight; tree renders a spinner.
 *   - `FileNode[]` → resolved contents.
 *   - Files ignore `children` entirely.
 */
export interface FileNode {
  id: string;
  name: string;
  kind: 'file' | 'folder';
  size?: number;
  modifiedAt?: Date;
  children?: ReadonlyArray<FileNode> | 'pending';
  mime?: string;
}

export type FileExplorerViewMode = 'list' | 'grid';

export interface FileExplorerAction<T extends FileNode = FileNode> {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Show a separator above this item in the context menu. */
  separatorBefore?: boolean;
  /** Disable the item when this predicate returns true for the active selection. */
  disabled?: (selected: ReadonlyArray<T>) => boolean;
  /** Hide the item entirely for the active selection. */
  hidden?: (selected: ReadonlyArray<T>) => boolean;
}

export interface FileExplorerProps<T extends FileNode = FileNode> {
  /** Root folder. Its own name is shown as the first breadcrumb. */
  root: T;

  /**
   * Path from `root` to the currently-open folder, expressed as the
   * ordered list of node IDs (excluding root). `[]` means root.
   */
  selectedPath?: ReadonlyArray<string>;
  defaultSelectedPath?: ReadonlyArray<string>;
  onSelectedPathChange?: (path: string[]) => void;

  viewMode?: FileExplorerViewMode;
  defaultViewMode?: FileExplorerViewMode;
  onViewModeChange?: (mode: FileExplorerViewMode) => void;

  /** Multi-select in the right pane. Defaults to true. */
  multiSelect?: boolean;

  /** Context-menu actions. Falls back to a default Open/Rename/Download/Delete set. */
  actions?: ReadonlyArray<FileExplorerAction<T>>;
  onAction?: (actionId: string, selected: T[]) => void;

  /**
   * Fires the first time a folder is expanded in the tree and its children
   * have not yet been loaded (i.e. `children` is `undefined`). The consumer
   * is expected to set the node's `children` to `'pending'` then to the
   * resolved array.
   */
  onLoadChildren?: (node: T) => void;

  /** Localized label for the root crumb. Defaults to the root node name. */
  rootLabel?: string;

  'aria-label'?: string;
  className?: string;
}
