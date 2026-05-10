import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Checkbox } from '@/components/forms/Checkbox';
import { Spinner } from '@/components/primitives/Spinner';
import { useControllableState } from '@/hooks/useControllableState';
import { useTypeahead } from '@/hooks/useTypeahead';
import type {
  TreeNode,
  TreeRenderItem,
  TreeRenderItemContext,
  TreeSelectionMode,
} from './TreeView.types';

interface FlatNode<T> {
  node: TreeNode<T>;
  level: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

function nodeHasChildren<T>(node: TreeNode<T>, expanded: ReadonlySet<string>): boolean {
  if (node.isLeaf === true) return false;
  if (node.isLeaf === false) return true;
  if (Array.isArray(node.children) && node.children.length > 0) return true;
  // unloaded folder while loading is also treated as having children
  if (node.isLoading === true && expanded.has(node.id)) return true;
  return false;
}

function flatten<T>(
  items: ReadonlyArray<TreeNode<T>>,
  expanded: ReadonlySet<string>,
  level = 1,
  parentId: string | null = null,
): FlatNode<T>[] {
  const out: FlatNode<T>[] = [];
  items.forEach((node, idx) => {
    const hasChildren = nodeHasChildren(node, expanded);
    const isExpanded = expanded.has(node.id);
    out.push({
      node,
      level,
      parentId,
      posInSet: idx + 1,
      setSize: items.length,
      hasChildren,
      isExpanded,
    });
    if (hasChildren && isExpanded && Array.isArray(node.children)) {
      out.push(...flatten(node.children, expanded, level + 1, node.id));
    }
  });
  return out;
}

function collectDescendantIds<T>(node: TreeNode<T>, into: Set<string>): void {
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) {
    into.add(child.id);
    collectDescendantIds(child, into);
  }
}

interface TreeViewContextValue<T> {
  selectionMode: TreeSelectionMode;
  selectedIds: ReadonlySet<string>;
  expandedIds: ReadonlySet<string>;
  focusedId: string | null;
  indeterminateIds: ReadonlySet<string>;
  registerItem: (id: string, el: HTMLElement | null) => void;
  toggleExpanded: (node: TreeNode<T>) => void;
  toggleSelected: (node: TreeNode<T>) => void;
  setFocusedId: (id: string) => void;
  flat: ReadonlyArray<FlatNode<T>>;
  onItemKeyDown: (e: ReactKeyboardEvent<HTMLElement>, id: string) => void;
  renderItem?: TreeRenderItem<T> | undefined;
  showCheckboxes: boolean;
}

const TreeViewContext = createContext<TreeViewContextValue<unknown> | null>(null);

function useTreeView<T>(): TreeViewContextValue<T> {
  const ctx = useContext(TreeViewContext);
  if (ctx === null) {
    throw new Error('TreeItem must be rendered inside a <TreeView>');
  }
  return ctx as TreeViewContextValue<T>;
}

export interface TreeViewProps<T = unknown> extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  ref?: Ref<HTMLUListElement>;
  items: ReadonlyArray<TreeNode<T>>;

  selectionMode?: TreeSelectionMode;

  selectedIds?: ReadonlyArray<string>;
  defaultSelectedIds?: ReadonlyArray<string>;
  onSelectedChange?: (ids: string[]) => void;

  expandedIds?: ReadonlyArray<string>;
  defaultExpandedIds?: ReadonlyArray<string>;
  onExpandedChange?: (ids: string[]) => void;

  /**
   * Fires the first time a folder with `isLeaf === false` and no children
   * is expanded. Use to lazily fetch children.
   */
  onLoadChildren?: (node: TreeNode<T>) => void;

  /**
   * Fires when a node is activated via Enter/Space (in addition to selection).
   * Useful for `selectionMode="none"` trees that act on click instead.
   */
  onNodeActivate?: (node: TreeNode<T>) => void;

  renderItem?: TreeRenderItem<T>;

  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function TreeView<T = unknown>({
  ref,
  items,
  className,
  selectionMode = 'none',
  selectedIds,
  defaultSelectedIds,
  onSelectedChange,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  onLoadChildren,
  onNodeActivate,
  renderItem,
  ...rest
}: TreeViewProps<T>) {
  const showCheckboxes = selectionMode === 'multiple';

  const [expandedArr, setExpandedArr] = useControllableState<ReadonlyArray<string>>({
    value: expandedIds,
    defaultValue: defaultExpandedIds ?? [],
    onChange: (next) => onExpandedChange?.(next as string[]),
  });
  const [selectedArr, setSelectedArr] = useControllableState<ReadonlyArray<string>>({
    value: selectedIds,
    defaultValue: defaultSelectedIds ?? [],
    onChange: (next) => onSelectedChange?.(next as string[]),
  });

  const expandedSet = useMemo(
    () => new Set<string>(expandedArr ?? []),
    [expandedArr],
  );
  const selectedSet = useMemo(
    () => new Set<string>(selectedArr ?? []),
    [selectedArr],
  );

  const flat = useMemo(() => flatten(items, expandedSet), [items, expandedSet]);

  // Indeterminate parents (multi mode only): parent itself NOT selected but
  // at least one descendant is.
  const indeterminateIds = useMemo<Set<string>>(() => {
    if (selectionMode !== 'multiple') return new Set();
    const result = new Set<string>();
    const visit = (n: TreeNode<T>) => {
      if (!Array.isArray(n.children) || n.children.length === 0) return;
      n.children.forEach(visit);
      if (selectedSet.has(n.id)) return;
      const desc = new Set<string>();
      collectDescendantIds(n, desc);
      for (const id of desc) {
        if (selectedSet.has(id)) {
          result.add(n.id);
          return;
        }
      }
    };
    items.forEach(visit);
    return result;
  }, [items, selectedSet, selectionMode]);

  // Track focused node as state so tabindex re-renders when it changes.
  const [focusedId, setFocusedIdState] = useState<string | null>(null);
  const effectiveFocusedId = useMemo<string | null>(() => {
    if (focusedId !== null && flat.some((f) => f.node.id === focusedId)) {
      return focusedId;
    }
    return flat[0]?.node.id ?? null;
  }, [focusedId, flat]);

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const registerItem = useCallback((id: string, el: HTMLElement | null) => {
    if (el === null) itemRefs.current.delete(id);
    else itemRefs.current.set(id, el);
  }, []);

  const focusId = useCallback((id: string) => {
    setFocusedIdState(id);
    const el = itemRefs.current.get(id);
    if (el !== undefined) el.focus();
  }, []);

  const setFocusedId = useCallback((id: string) => {
    setFocusedIdState(id);
  }, []);

  // Track which folders we've already kicked off load for so we don't spam.
  const loadedOnceRef = useRef<Set<string>>(new Set());

  const expand = useCallback(
    (node: TreeNode<T>) => {
      setExpandedArr((prev) => {
        const set = new Set(prev ?? []);
        if (set.has(node.id)) return Array.from(set);
        set.add(node.id);
        return Array.from(set);
      });
      if (
        node.isLeaf === false &&
        (!Array.isArray(node.children) || node.children.length === 0) &&
        !loadedOnceRef.current.has(node.id)
      ) {
        loadedOnceRef.current.add(node.id);
        onLoadChildren?.(node);
      }
    },
    [setExpandedArr, onLoadChildren],
  );

  const collapse = useCallback(
    (id: string) => {
      setExpandedArr((prev) => (prev ?? []).filter((x) => x !== id));
    },
    [setExpandedArr],
  );

  const toggleExpanded = useCallback(
    (node: TreeNode<T>) => {
      if (expandedSet.has(node.id)) collapse(node.id);
      else expand(node);
    },
    [expandedSet, collapse, expand],
  );

  const toggleSelected = useCallback(
    (node: TreeNode<T>) => {
      if (node.disabled === true) return;
      if (selectionMode === 'none') {
        onNodeActivate?.(node);
        return;
      }
      if (selectionMode === 'single') {
        setSelectedArr([node.id]);
        onNodeActivate?.(node);
        return;
      }
      // multiple: toggle this node and cascade to descendants
      setSelectedArr((prev) => {
        const set = new Set(prev ?? []);
        const descendants = new Set<string>([node.id]);
        collectDescendantIds(node, descendants);
        const isOn = set.has(node.id);
        if (isOn) {
          for (const id of descendants) set.delete(id);
        } else {
          for (const id of descendants) set.add(id);
        }
        return Array.from(set);
      });
      onNodeActivate?.(node);
    },
    [selectionMode, setSelectedArr, onNodeActivate],
  );

  // Typeahead over visible flat list.
  const typeahead = useTypeahead<FlatNode<T>>({
    items: flat,
    getItemValue: (f) => f.node.label,
    onMatch: (idx) => {
      const target = flat[idx];
      if (target !== undefined) focusId(target.node.id);
    },
    getCurrentIndex: () => {
      if (effectiveFocusedId === null) return -1;
      return flat.findIndex((f) => f.node.id === effectiveFocusedId);
    },
  });

  const onItemKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>, id: string) => {
      const idx = flat.findIndex((f) => f.node.id === id);
      if (idx === -1) return;
      const entry = flat[idx]!;

      const focusAt = (i: number) => {
        const target = flat[i];
        if (target !== undefined) focusId(target.node.id);
      };

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (idx < flat.length - 1) focusAt(idx + 1);
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (idx > 0) focusAt(idx - 1);
          return;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (entry.hasChildren && !entry.isExpanded) {
            expand(entry.node);
          } else if (entry.hasChildren && entry.isExpanded) {
            // first child is next entry
            if (idx < flat.length - 1) focusAt(idx + 1);
          }
          return;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (entry.hasChildren && entry.isExpanded) {
            collapse(entry.node.id);
          } else if (entry.parentId !== null) {
            const parentIdx = flat.findIndex((f) => f.node.id === entry.parentId);
            if (parentIdx !== -1) focusAt(parentIdx);
          }
          return;
        }
        case 'Home': {
          e.preventDefault();
          focusAt(0);
          return;
        }
        case 'End': {
          e.preventDefault();
          focusAt(flat.length - 1);
          return;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          toggleSelected(entry.node);
          return;
        }
        case '*': {
          e.preventDefault();
          // expand all siblings of focused node at same level under same parent
          setExpandedArr((prev) => {
            const set = new Set(prev ?? []);
            for (const f of flat) {
              if (f.parentId === entry.parentId && f.hasChildren) {
                set.add(f.node.id);
              }
            }
            return Array.from(set);
          });
          return;
        }
        default:
          typeahead.onKeyDown(e);
      }
    },
    [flat, focusId, expand, collapse, toggleSelected, setExpandedArr, typeahead],
  );

  const ctxValue = useMemo<TreeViewContextValue<T>>(
    () => ({
      selectionMode,
      selectedIds: selectedSet,
      expandedIds: expandedSet,
      focusedId: effectiveFocusedId,
      indeterminateIds,
      registerItem,
      toggleExpanded,
      toggleSelected,
      setFocusedId,
      flat,
      onItemKeyDown,
      renderItem,
      showCheckboxes,
    }),
    [
      selectionMode,
      selectedSet,
      expandedSet,
      effectiveFocusedId,
      indeterminateIds,
      registerItem,
      toggleExpanded,
      toggleSelected,
      setFocusedId,
      flat,
      onItemKeyDown,
      renderItem,
      showCheckboxes,
    ],
  );

  return (
    <TreeViewContext.Provider value={ctxValue as TreeViewContextValue<unknown>}>
      <ul
        ref={ref}
        role="tree"
        aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
        className={cn('select-none text-sm text-foreground', className)}
        {...rest}
      >
        {items.map((node, idx) => (
          <TreeItem<T>
            key={node.id}
            node={node}
            level={1}
            posInSet={idx + 1}
            setSize={items.length}
          />
        ))}
      </ul>
    </TreeViewContext.Provider>
  );
}

interface TreeItemProps<T> {
  node: TreeNode<T>;
  level: number;
  posInSet: number;
  setSize: number;
}

export function TreeItem<T = unknown>({ node, level, posInSet, setSize }: TreeItemProps<T>) {
  const ctx = useTreeView<T>();
  const ref = useRef<HTMLLIElement>(null);

  const hasChildren = nodeHasChildren(node, ctx.expandedIds);
  const isExpanded = ctx.expandedIds.has(node.id);
  const isSelected = ctx.selectedIds.has(node.id);
  const isIndeterminate = ctx.indeterminateIds.has(node.id);
  const isFocused = ctx.focusedId === node.id;
  const isLoading = node.isLoading === true;

  useEffect(() => {
    ctx.registerItem(node.id, ref.current);
    return () => ctx.registerItem(node.id, null);
  }, [ctx, node.id]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLLIElement>) => {
    if (node.disabled === true) return;
    // Each treeitem nests inside its parent treeitem's <li>, so keydown bubbles
    // up. Stop propagation here so the parent doesn't double-handle.
    e.stopPropagation();
    ctx.onItemKeyDown(e, node.id);
  };

  const onRowClick = (e: ReactMouseEvent<HTMLLIElement>) => {
    if (node.disabled === true) return;
    e.stopPropagation();
    ctx.setFocusedId(node.id);
    ref.current?.focus();
    ctx.toggleSelected(node);
  };

  const onChevronClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (node.disabled === true) return;
    ctx.toggleExpanded(node);
    ctx.setFocusedId(node.id);
    ref.current?.focus();
  };

  const renderCtx: TreeRenderItemContext<T> = {
    node,
    level,
    isExpanded,
    isSelected,
    isIndeterminate,
    isFocused,
    hasChildren,
    isLoading,
    toggleExpanded: () => ctx.toggleExpanded(node),
    toggleSelected: () => ctx.toggleSelected(node),
  };

  // Selection state for ARIA. Only set if a selection mode is active.
  const ariaSelected: true | false | undefined =
    ctx.selectionMode === 'none' ? undefined : isSelected;

  return (
    <li
      ref={ref}
      role="treeitem"
      tabIndex={isFocused ? 0 : -1}
      aria-label={node.label}
      aria-level={level}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={ariaSelected}
      aria-disabled={node.disabled === true ? true : undefined}
      onKeyDown={onKeyDown}
      onClick={onRowClick}
      onFocus={() => ctx.setFocusedId(node.id)}
      className="outline-none"
    >
      {ctx.renderItem !== undefined ? (
        <div>{ctx.renderItem(renderCtx)}</div>
      ) : (
        <div
          className={cn(
            'group flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors',
            'hover:bg-surface-muted',
            isSelected && 'bg-primary/10 text-foreground',
            isFocused && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
            node.disabled === true && 'cursor-not-allowed opacity-50',
          )}
          style={{ paddingInlineStart: `${(level - 1) * 16 + 6}px` }}
        >
          <DisclosureGlyph
            hasChildren={hasChildren}
            isExpanded={isExpanded}
            isLoading={isLoading}
            disabled={node.disabled === true}
            onClick={onChevronClick}
          />
          {ctx.showCheckboxes ? (
            <Checkbox
              checked={isSelected}
              indeterminate={isIndeterminate}
              disabled={node.disabled === true}
              onClick={(e) => {
                e.stopPropagation();
                ctx.toggleSelected(node);
                ctx.setFocusedId(node.id);
                ref.current?.focus();
              }}
              onChange={() => {
                /* handled by onClick to avoid double-fire */
              }}
              tabIndex={-1}
              aria-hidden="true"
            />
          ) : null}
          <span className="min-w-0 flex-1 truncate">{node.label}</span>
        </div>
      )}

      {hasChildren && isExpanded && Array.isArray(node.children) ? (
        <ul role="group" className="m-0 list-none p-0">
          {node.children.map((child, idx) => (
            <TreeItem<T>
              key={child.id}
              node={child}
              level={level + 1}
              posInSet={idx + 1}
              setSize={node.children!.length}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface DisclosureGlyphProps {
  hasChildren: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  disabled: boolean;
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}

function DisclosureGlyph({
  hasChildren,
  isExpanded,
  isLoading,
  disabled,
  onClick,
}: DisclosureGlyphProps) {
  if (!hasChildren && !isLoading) {
    return <span aria-hidden="true" className="inline-block h-4 w-4 shrink-0" />;
  }
  if (isLoading) {
    return (
      <span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <Spinner size="xs" />
      </span>
    );
  }
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-foreground-muted transition-transform',
        isExpanded && 'rotate-90',
        'hover:text-foreground',
      )}
    >
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
  );
}
