import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  File as FileIconLucide,
  FileCode,
  FileImage,
  FileText,
  Folder,
  LayoutGrid,
  List as ListIconLucide,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/date';
import { SplitLayout } from '@/components/layout/SplitLayout';
import { TreeView } from '@/components/data-display/TreeView';
import type { TreeNode } from '@/components/data-display/TreeView';
import {
  Breadcrumbs,
  BreadcrumbCurrent,
  BreadcrumbItem,
} from '@/components/navigation/Breadcrumbs';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/navigation/ContextMenu';
import { EmptyState } from '@/components/data-display/EmptyState';
import { IconButton } from '@/components/primitives/IconButton';
import type {
  FileExplorerAction,
  FileExplorerProps,
  FileExplorerViewMode,
  FileNode,
} from './FileExplorer.types';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function findNodeByPath(root: FileNode, path: ReadonlyArray<string>): FileNode | null {
  let cur: FileNode = root;
  for (const id of path) {
    if (!Array.isArray(cur.children)) return null;
    const next = cur.children.find((c) => c.id === id);
    if (next === undefined) return null;
    cur = next;
  }
  return cur;
}

function findPathToId(root: FileNode, targetId: string): string[] | null {
  if (!Array.isArray(root.children)) return null;
  for (const child of root.children) {
    if (child.id === targetId) return [child.id];
    const sub = findPathToId(child, targetId);
    if (sub !== null) return [child.id, ...sub];
  }
  return null;
}

function toTreeNodes(
  children: ReadonlyArray<FileNode> | 'pending' | undefined,
): TreeNode<FileNode>[] {
  if (!Array.isArray(children)) return [];
  return children
    .filter((n) => n.kind === 'folder')
    .map((n) => {
      const isPending = n.children === 'pending';
      const tn: TreeNode<FileNode> = {
        id: n.id,
        label: n.name,
        data: n,
        isLeaf: false,
        isLoading: isPending,
      };
      if (Array.isArray(n.children)) {
        tn.children = toTreeNodes(n.children);
      }
      return tn;
    });
}

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function iconForNode(node: FileNode): ReactNode {
  if (node.kind === 'folder') {
    return <Folder className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />;
  }
  const mime = node.mime ?? '';
  if (mime.startsWith('image/')) {
    return <FileImage className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />;
  }
  if (mime.startsWith('text/') || /\.md$/i.test(node.name)) {
    return <FileText className="h-4 w-4 shrink-0 text-foreground-muted" aria-hidden="true" />;
  }
  if (
    /\.(ts|tsx|js|jsx|json|css|html|py|go|rs|java|sh)$/i.test(node.name) ||
    mime.includes('javascript') ||
    mime.includes('typescript')
  ) {
    return <FileCode className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />;
  }
  return <FileIconLucide className="h-4 w-4 shrink-0 text-foreground-muted" aria-hidden="true" />;
}

const DEFAULT_ACTIONS: ReadonlyArray<FileExplorerAction> = [
  { id: 'open', label: 'Open' },
  { id: 'rename', label: 'Rename' },
  { id: 'download', label: 'Download' },
  { id: 'delete', label: 'Delete', separatorBefore: true },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function FileExplorer<T extends FileNode = FileNode>({
  root,
  selectedPath,
  defaultSelectedPath,
  onSelectedPathChange,
  viewMode,
  defaultViewMode,
  onViewModeChange,
  multiSelect = true,
  actions,
  onAction,
  onLoadChildren,
  rootLabel,
  className,
  'aria-label': ariaLabel = 'File explorer',
}: FileExplorerProps<T>) {
  /* Path (controlled or uncontrolled). */
  const isPathControlled = selectedPath !== undefined;
  const [internalPath, setInternalPath] = useState<ReadonlyArray<string>>(
    defaultSelectedPath ?? [],
  );
  const path: ReadonlyArray<string> = isPathControlled ? selectedPath : internalPath;
  const setPath = useCallback(
    (next: ReadonlyArray<string>) => {
      if (!isPathControlled) setInternalPath(next);
      onSelectedPathChange?.([...next]);
    },
    [isPathControlled, onSelectedPathChange],
  );

  /* View mode (controlled or uncontrolled). */
  const isViewControlled = viewMode !== undefined;
  const [internalView, setInternalView] = useState<FileExplorerViewMode>(
    defaultViewMode ?? 'list',
  );
  const mode: FileExplorerViewMode = isViewControlled ? viewMode : internalView;
  const setMode = useCallback(
    (next: FileExplorerViewMode) => {
      if (!isViewControlled) setInternalView(next);
      onViewModeChange?.(next);
    },
    [isViewControlled, onViewModeChange],
  );

  /* Tree expanded state — user expansions stored; path ancestors are merged in
     at render time so the chain to the current folder is always visible. */
  const [userExpanded, setUserExpanded] = useState<ReadonlySet<string>>(
    () => new Set(path),
  );
  const expandedIds = useMemo(() => {
    const next = new Set(userExpanded);
    for (const id of path) next.add(id);
    return Array.from(next);
  }, [userExpanded, path]);
  const handleExpandedChange = useCallback((ids: string[]) => {
    setUserExpanded(new Set(ids));
  }, []);

  /* Current folder lookup. */
  const current = useMemo(() => findNodeByPath(root, path), [root, path]);
  const treeItems = useMemo(() => toTreeNodes(root.children), [root.children]);

  /* Right-pane multi-select state. Reset on path change using the
     "store previous prop" pattern (React docs: resetting state when a
     prop changes), so we avoid setState-inside-useEffect cascades. */
  const [prevPath, setPrevPath] = useState<ReadonlyArray<string>>(path);
  const [selectedFileIds, setSelectedFileIds] = useState<ReadonlySet<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  if (prevPath !== path) {
    setPrevPath(path);
    setSelectedFileIds(new Set());
    setAnchorId(null);
  }

  const items: ReadonlyArray<FileNode> = useMemo(
    () =>
      current !== null && Array.isArray(current.children) ? current.children : [],
    [current],
  );
  const isLoadingCurrent = current?.children === 'pending';

  /* -------------------------------------------------------------------------- */
  /*  Tree event handlers                                                       */
  /* -------------------------------------------------------------------------- */

  const handleTreeSelect = useCallback(
    (ids: string[]) => {
      const id = ids[0];
      if (id === undefined) {
        setPath([]);
        return;
      }
      const p = findPathToId(root, id);
      if (p !== null) setPath(p);
    },
    [root, setPath],
  );

  const handleTreeLoadChildren = useCallback(
    (node: TreeNode<FileNode>) => {
      if (node.data !== undefined) {
        onLoadChildren?.(node.data as T);
      }
    },
    [onLoadChildren],
  );

  /* -------------------------------------------------------------------------- */
  /*  Right pane selection                                                      */
  /* -------------------------------------------------------------------------- */

  const selectSingle = useCallback((id: string) => {
    setSelectedFileIds(new Set([id]));
    setAnchorId(id);
  }, []);

  const handleItemActivate = useCallback(
    (item: FileNode, mods: { ctrl: boolean; shift: boolean }) => {
      if (!multiSelect || (!mods.ctrl && !mods.shift)) {
        selectSingle(item.id);
        return;
      }
      if (mods.shift && anchorId !== null) {
        const startIdx = items.findIndex((i) => i.id === anchorId);
        const endIdx = items.findIndex((i) => i.id === item.id);
        if (startIdx !== -1 && endIdx !== -1) {
          const lo = Math.min(startIdx, endIdx);
          const hi = Math.max(startIdx, endIdx);
          setSelectedFileIds(new Set(items.slice(lo, hi + 1).map((i) => i.id)));
        }
        return;
      }
      // Ctrl/Cmd toggle
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
        return next;
      });
      setAnchorId(item.id);
    },
    [multiSelect, anchorId, items, selectSingle],
  );

  const handleItemDoubleClick = useCallback(
    (item: FileNode) => {
      if (item.kind === 'folder') {
        setPath([...path, item.id]);
      } else {
        onAction?.('open', [item as T]);
      }
    },
    [path, setPath, onAction],
  );

  const handleItemContextMenu = useCallback(
    (item: FileNode) => {
      // Right-clicking a non-selected item replaces selection.
      if (!selectedFileIds.has(item.id)) {
        selectSingle(item.id);
      }
    },
    [selectedFileIds, selectSingle],
  );

  const navigateToCrumb = useCallback(
    (index: number) => {
      if (index < 0) setPath([]);
      else setPath(path.slice(0, index + 1));
    },
    [path, setPath],
  );

  /* -------------------------------------------------------------------------- */
  /*  Derived: selected nodes + effective actions                               */
  /* -------------------------------------------------------------------------- */

  const selectedNodes = useMemo<T[]>(
    () => items.filter((i) => selectedFileIds.has(i.id)) as T[],
    [items, selectedFileIds],
  );

  const effectiveActions = useMemo<ReadonlyArray<FileExplorerAction<T>>>(
    () => actions ?? (DEFAULT_ACTIONS as ReadonlyArray<FileExplorerAction<T>>),
    [actions],
  );

  const visibleActions = useMemo(
    () => effectiveActions.filter((a) => a.hidden === undefined || !a.hidden(selectedNodes)),
    [effectiveActions, selectedNodes],
  );

  /* -------------------------------------------------------------------------- */
  /*  Render: tree pane                                                         */
  /* -------------------------------------------------------------------------- */

  const treeSelectedIds = useMemo<string[]>(() => {
    if (path.length === 0) return [];
    const last = path[path.length - 1];
    return last !== undefined ? [last] : [];
  }, [path]);

  const isAtRoot = path.length === 0;

  const treePane = (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Folder className="h-4 w-4 text-warning" aria-hidden="true" />
        <span className="truncate text-sm font-medium text-foreground">
          {rootLabel ?? root.name}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <button
          type="button"
          onClick={() => setPath([])}
          aria-current={isAtRoot ? true : undefined}
          data-testid="fe-root-crumb"
          className={cn(
            'mb-1 flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm',
            'hover:bg-surface-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
            isAtRoot && 'bg-primary/10 text-foreground',
          )}
        >
          <Folder className="h-4 w-4 text-warning" aria-hidden="true" />
          <span className="truncate">{rootLabel ?? root.name}</span>
        </button>
        <TreeView<FileNode>
          items={treeItems}
          selectionMode="single"
          selectedIds={treeSelectedIds}
          onSelectedChange={handleTreeSelect}
          expandedIds={expandedIds}
          onExpandedChange={handleExpandedChange}
          onLoadChildren={handleTreeLoadChildren}
          aria-label="Folders"
        />
      </div>
    </div>
  );

  /* -------------------------------------------------------------------------- */
  /*  Render: right pane                                                        */
  /* -------------------------------------------------------------------------- */

  const folderName = current?.name ?? root.name;

  const rightToolbar = (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2">
      <Breadcrumbs aria-label="Folder path" className="min-w-0 flex-1 truncate">
        <BreadcrumbItem>
          {isAtRoot ? (
            <BreadcrumbCurrent>{rootLabel ?? root.name}</BreadcrumbCurrent>
          ) : (
            <button
              type="button"
              onClick={() => navigateToCrumb(-1)}
              data-testid="fe-crumb-root"
              className={cn(
                'rounded-sm text-foreground-muted transition-colors hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              {rootLabel ?? root.name}
            </button>
          )}
        </BreadcrumbItem>
        {path.map((segId, i) => {
          const segNode = findNodeByPath(root, path.slice(0, i + 1));
          const label = segNode?.name ?? segId;
          const isLast = i === path.length - 1;
          return (
            <BreadcrumbItem key={segId}>
              {isLast ? (
                <BreadcrumbCurrent>{label}</BreadcrumbCurrent>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateToCrumb(i)}
                  data-testid={`fe-crumb-${segId}`}
                  className={cn(
                    'rounded-sm text-foreground-muted transition-colors hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                >
                  {label}
                </button>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
      <div
        role="group"
        aria-label="View mode"
        className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface p-0.5"
      >
        <IconButton
          variant={mode === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          aria-label="List view"
          aria-pressed={mode === 'list'}
          onClick={() => setMode('list')}
        >
          <ListIconLucide className="h-4 w-4" aria-hidden="true" />
        </IconButton>
        <IconButton
          variant={mode === 'grid' ? 'secondary' : 'ghost'}
          size="sm"
          aria-label="Grid view"
          aria-pressed={mode === 'grid'}
          onClick={() => setMode('grid')}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );

  let rightContent: ReactNode;
  if (current === null) {
    rightContent = (
      <EmptyState
        icon={<Folder className="h-6 w-6" aria-hidden="true" />}
        title="Folder not found"
        description="The selected folder is no longer available."
      />
    );
  } else if (isLoadingCurrent) {
    rightContent = (
      <div className="flex h-full items-center justify-center p-8 text-foreground-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  } else if (items.length === 0) {
    rightContent = (
      <EmptyState
        icon={<Folder className="h-6 w-6" aria-hidden="true" />}
        title="Empty folder"
        description="No files or subfolders here yet."
      />
    );
  } else if (mode === 'list') {
    rightContent = (
      <FileListView
        items={items}
        selectedIds={selectedFileIds}
        multiSelect={multiSelect}
        ariaLabel={`Contents of ${folderName}`}
        onItemActivate={handleItemActivate}
        onItemDoubleClick={handleItemDoubleClick}
        onItemContextMenu={handleItemContextMenu}
      />
    );
  } else {
    rightContent = (
      <FileGridView
        items={items}
        selectedIds={selectedFileIds}
        multiSelect={multiSelect}
        ariaLabel={`Contents of ${folderName}`}
        onItemActivate={handleItemActivate}
        onItemDoubleClick={handleItemDoubleClick}
        onItemContextMenu={handleItemContextMenu}
      />
    );
  }

  const rightPane = (
    <div className="flex h-full min-h-0 flex-col">
      {rightToolbar}
      <ContextMenu>
        <ContextMenuTrigger className="min-h-0 flex-1 overflow-auto">
          {rightContent}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {visibleActions.map((action) => {
            const disabled =
              selectedNodes.length === 0 ||
              (action.disabled !== undefined && action.disabled(selectedNodes));
            return (
              <Fragment key={action.id}>
                {action.separatorBefore === true ? <ContextMenuSeparator /> : null}
                <ContextMenuItem
                  disabled={disabled}
                  onSelect={() => onAction?.(action.id, selectedNodes)}
                >
                  <span className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </span>
                </ContextMenuItem>
              </Fragment>
            );
          })}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );

  return (
    <div
      data-component="file-explorer"
      data-label={ariaLabel}
      className={cn('flex h-full min-h-0 w-full overflow-hidden', className)}
    >
      <SplitLayout
        left={treePane}
        right={rightPane}
        defaultLeftWidth={280}
        minLeftWidth={200}
        maxLeftWidth={500}
        separatorLabel="Resize folder pane"
        className="h-full"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inner views                                                               */
/* -------------------------------------------------------------------------- */

interface ViewProps {
  items: ReadonlyArray<FileNode>;
  selectedIds: ReadonlySet<string>;
  multiSelect: boolean;
  ariaLabel: string;
  onItemActivate: (item: FileNode, mods: { ctrl: boolean; shift: boolean }) => void;
  onItemDoubleClick: (item: FileNode) => void;
  onItemContextMenu: (item: FileNode) => void;
}

function modsFromMouse(e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }): {
  ctrl: boolean;
  shift: boolean;
} {
  return { ctrl: e.metaKey || e.ctrlKey, shift: e.shiftKey };
}

function handleItemKeyDown(
  e: ReactKeyboardEvent<HTMLElement>,
  item: FileNode,
  onItemActivate: ViewProps['onItemActivate'],
  onItemDoubleClick: ViewProps['onItemDoubleClick'],
): void {
  if (e.key === 'Enter') {
    e.preventDefault();
    onItemDoubleClick(item);
    return;
  }
  if (e.key === ' ') {
    e.preventDefault();
    onItemActivate(item, modsFromMouse(e));
  }
}

function FileListView({
  items,
  selectedIds,
  multiSelect,
  ariaLabel,
  onItemActivate,
  onItemDoubleClick,
  onItemContextMenu,
}: ViewProps) {
  const firstFocusable = useMemo(() => {
    if (selectedIds.size > 0) {
      return items.find((i) => selectedIds.has(i.id))?.id ?? items[0]?.id ?? null;
    }
    return items[0]?.id ?? null;
  }, [items, selectedIds]);

  return (
    <div className="flex h-full flex-col">
      <div
        role="presentation"
        className="grid grid-cols-[1fr_8rem_10rem] gap-3 border-b border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground-muted"
      >
        <span>Name</span>
        <span>Size</span>
        <span>Modified</span>
      </div>
      <ul
        role="listbox"
        aria-multiselectable={multiSelect}
        aria-label={ariaLabel}
        className="m-0 min-h-0 flex-1 list-none overflow-auto p-0"
      >
        {items.map((item) => {
          const selected = selectedIds.has(item.id);
          return (
            <li
              key={item.id}
              role="option"
              aria-selected={selected}
              tabIndex={item.id === firstFocusable ? 0 : -1}
              data-testid={`fe-row-${item.id}`}
              onClick={(e) => onItemActivate(item, modsFromMouse(e))}
              onDoubleClick={() => onItemDoubleClick(item)}
              onContextMenu={() => onItemContextMenu(item)}
              onKeyDown={(e) => handleItemKeyDown(e, item, onItemActivate, onItemDoubleClick)}
              className={cn(
                'grid cursor-default grid-cols-[1fr_8rem_10rem] gap-3 px-3 py-1.5 text-sm',
                'border-b border-border/60 last:border-b-0',
                'hover:bg-surface-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                selected && 'bg-primary/10 text-foreground',
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {iconForNode(item)}
                <span className="truncate">{item.name}</span>
              </span>
              <span className="self-center text-xs text-foreground-muted">
                {item.kind === 'file' ? formatSize(item.size) : '—'}
              </span>
              <span className="self-center text-xs text-foreground-muted">
                {item.modifiedAt !== undefined ? formatDate(item.modifiedAt, 'PP') : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FileGridView({
  items,
  selectedIds,
  multiSelect,
  ariaLabel,
  onItemActivate,
  onItemDoubleClick,
  onItemContextMenu,
}: ViewProps) {
  const firstFocusable = useMemo(() => {
    if (selectedIds.size > 0) {
      return items.find((i) => selectedIds.has(i.id))?.id ?? items[0]?.id ?? null;
    }
    return items[0]?.id ?? null;
  }, [items, selectedIds]);

  return (
    <ul
      role="listbox"
      aria-multiselectable={multiSelect}
      aria-label={ariaLabel}
      className="m-0 grid h-full list-none auto-rows-min grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] content-start gap-3 overflow-auto p-4"
    >
      {items.map((item) => {
        const selected = selectedIds.has(item.id);
        return (
          <li
            key={item.id}
            role="option"
            aria-selected={selected}
            tabIndex={item.id === firstFocusable ? 0 : -1}
            data-testid={`fe-tile-${item.id}`}
            onClick={(e) => onItemActivate(item, modsFromMouse(e))}
            onDoubleClick={() => onItemDoubleClick(item)}
            onContextMenu={() => onItemContextMenu(item)}
            onKeyDown={(e) => handleItemKeyDown(e, item, onItemActivate, onItemDoubleClick)}
            className={cn(
              'flex cursor-default flex-col items-center gap-2 rounded-md border border-transparent p-3 text-center',
              'hover:bg-surface-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              selected && 'border-primary/30 bg-primary/10',
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-muted">
              {item.kind === 'folder' ? (
                <Folder className="h-7 w-7 text-warning" aria-hidden="true" />
              ) : (
                <span className="inline-flex [&_svg]:h-7 [&_svg]:w-7">{iconForNode(item)}</span>
              )}
            </span>
            <span className="block w-full break-words text-xs text-foreground">{item.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
