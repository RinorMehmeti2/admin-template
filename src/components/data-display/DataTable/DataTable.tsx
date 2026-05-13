import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ExpandedState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Filter as FilterIcon,
  Inbox,
  Pin,
  PinOff,
  Search,
  X,
} from 'lucide-react';
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { usePrintMode } from '@/hooks/usePrintMode';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Skeleton } from '@/components/primitives/Skeleton';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/forms/Input';
import { Checkbox } from '@/components/forms/Checkbox';
import { Select } from '@/components/forms/Select';
import { DateRangePicker, type DateRange } from '@/components/forms/DateRangePicker';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/navigation/DropdownMenu';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  type TableProps,
} from '../Table';
import { EmptyState } from '../EmptyState';
import { arrIncludesSome, inDateRange, inNumberRange } from './filters';

/*
 * Generic, headless-state-driven DataTable. State lives in @tanstack/react-table
 * — we compose our own visual primitives on top.
 *
 * TODO: server-side data. To swap to manual mode add the following controlled
 * props: { manualSorting, manualFiltering, manualPagination, pageCount,
 * rowCount, sorting, columnFilters, pagination, onSortingChange,
 * onColumnFiltersChange, onPaginationChange }. Wire each onChange to the
 * caller; pass sorting/filtering/pagination back. URL-state sync is also
 * deferred (?sort=, ?filter=, ?page=). See CONTRIBUTING.md.
 *
 * TODO: column reorder via drag. Deferred — wire columnOrder state +
 * onColumnOrderChange with our useDrag hook + insertion-line UI in <TableHead>.
 *
 * TODO: virtualization. TanStack Virtual is a future carve-out candidate when
 * row counts exceed ~1k.
 */

declare module '@tanstack/react-table' {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Renders the appropriate filter input under the column header. */
    filterVariant?: 'text' | 'select' | 'multi-select' | 'range' | 'date-range';
    /** Options for select / multi-select filters. */
    filterOptions?: ReadonlyArray<{ label: string; value: string }>;
    /** Plain label for filter chips when `header` is JSX. */
    headerLabel?: string;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export type {
  ColumnDef,
  Row,
  SortingState,
  RowSelectionState,
  VisibilityState,
  ColumnPinningState,
  ExpandedState,
};
export { arrIncludesSome, inDateRange, inNumberRange };

export interface DataTableToolbarSlots {
  left?: ReactNode;
  right?: ReactNode;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];

  /** Stable id per row. Defaults to row index. */
  getRowId?: (row: TData, index: number) => string;

  /* Sorting */
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  defaultSorting?: SortingState;

  /* Filtering */
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  searchPlaceholder?: string;
  /** Show the active filter chip strip above the table. Default: true when column filters enabled. */
  showFilterChips?: boolean;

  /* Selection */
  enableRowSelection?: boolean | 'single' | 'multi' | ((row: Row<TData>) => boolean);
  onRowSelectionChange?: (rows: TData[]) => void;

  /* Visibility */
  enableColumnVisibility?: boolean;

  /* Pinning */
  enableColumnPinning?: boolean;
  defaultColumnPinning?: ColumnPinningState;

  /* Expansion */
  enableExpanding?: boolean;
  getSubRows?: (row: TData) => TData[] | undefined;
  /** Custom expanded panel renderer. Mutually exclusive with `getSubRows`. */
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
  defaultExpanded?: ExpandedState;
  /** Controlled expanded state. When set, defaultExpanded is ignored. */
  expanded?: ExpandedState;
  onExpandedChange?: (state: ExpandedState) => void;

  /* Pagination */
  pageSize?: number;
  pageSizeOptions?: number[];

  /* Behavior */
  onRowClick?: (row: TData, event: React.MouseEvent<HTMLTableRowElement>) => void;

  /* Visual */
  variant?: TableProps['variant'];
  size?: TableProps['size'];
  stickyHeader?: boolean;
  /** Outer container max-height. Pair with stickyHeader for a scrollable body. */
  maxHeight?: string;
  containerClassName?: string;

  /* States */
  isLoading?: boolean;
  /** Skeleton row count while loading. Defaults to pageSize. */
  skeletonRows?: number;
  emptyState?: ReactNode;

  /* Toolbar slots */
  toolbar?: DataTableToolbarSlots;

  className?: string;
}

const SELECT_COLUMN_ID = '__select__';
const EXPAND_COLUMN_ID = '__expand__';
const INTERNAL_COLUMN_IDS: ReadonlySet<string> = new Set([SELECT_COLUMN_ID, EXPAND_COLUMN_ID]);

function buildSelectColumn<TData>(mode: 'single' | 'multi'): ColumnDef<TData, unknown> {
  return {
    id: SELECT_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enablePinning: false,
    size: 36,
    header: ({ table }) =>
      mode === 'multi' ? (
        <Checkbox
          aria-label="Select all rows on page"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ) : (
        <span className="sr-only">Select</span>
      ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select row ${row.index + 1}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  };
}

function buildExpandColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: EXPAND_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enablePinning: false,
    size: 32,
    header: () => <span className="sr-only">Expand</span>,
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null;
      const expanded = row.getIsExpanded();
      return (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse row' : 'Expand row'}
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-foreground-muted transition-transform hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          style={{ marginLeft: `${row.depth * 1}rem` }}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              expanded && 'rotate-90',
            )}
            aria-hidden="true"
          />
        </button>
      );
    },
  };
}

function defaultEmpty(): ReactNode {
  return (
    <EmptyState
      icon={<Inbox className="h-6 w-6" />}
      title="No results"
      description="Try adjusting filters or search."
    />
  );
}

function augmentColumnsWithFilterFns<TData>(
  columns: ColumnDef<TData, unknown>[],
): ColumnDef<TData, unknown>[] {
  type FilterFnAny = NonNullable<ColumnDef<TData, unknown>['filterFn']>;
  return columns.map((col) => {
    const variant = col.meta?.filterVariant;
    if (variant === undefined) return col;
    if (col.filterFn !== undefined) return col;
    if (variant === 'multi-select')
      return { ...col, filterFn: arrIncludesSome as unknown as FilterFnAny };
    if (variant === 'range')
      return { ...col, filterFn: inNumberRange as unknown as FilterFnAny };
    if (variant === 'date-range')
      return { ...col, filterFn: inDateRange as unknown as FilterFnAny };
    if (variant === 'select') return { ...col, filterFn: 'equalsString' as const };
    return col;
  });
}

function getColumnLabel<TData>(col: Column<TData, unknown>): string {
  const meta = col.columnDef.meta?.headerLabel;
  if (typeof meta === 'string' && meta.length > 0) return meta;
  const header = col.columnDef.header;
  if (typeof header === 'string' && header.length > 0) return header;
  return col.id;
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  enableSorting = true,
  enableMultiSort = false,
  defaultSorting,
  enableGlobalFilter = true,
  enableColumnFilters = false,
  searchPlaceholder = 'Search…',
  showFilterChips,
  enableRowSelection = false,
  onRowSelectionChange,
  enableColumnVisibility = true,
  enableColumnPinning = false,
  defaultColumnPinning,
  enableExpanding = false,
  getSubRows,
  renderExpandedRow,
  defaultExpanded,
  expanded: expandedProp,
  onExpandedChange,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onRowClick,
  variant,
  size,
  stickyHeader = true,
  maxHeight,
  containerClassName,
  isLoading = false,
  skeletonRows,
  emptyState,
  toolbar,
  className,
}: DataTableProps<TData>) {
  const selectionMode: 'none' | 'single' | 'multi' =
    enableRowSelection === false
      ? 'none'
      : enableRowSelection === 'single'
        ? 'single'
        : enableRowSelection === true || enableRowSelection === 'multi'
          ? 'multi'
          : 'multi';

  const allColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    const userCols = augmentColumnsWithFilterFns(columns);
    const prefix: ColumnDef<TData, unknown>[] = [];
    if (enableExpanding) prefix.push(buildExpandColumn<TData>());
    if (selectionMode !== 'none') prefix.push(buildSelectColumn<TData>(selectionMode));
    return [...prefix, ...userCols];
  }, [columns, selectionMode, enableExpanding]);

  /* ------------------------------ table state ----------------------------- */
  const [sorting, setSorting] = useState<SortingState>(defaultSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    defaultColumnPinning ?? { left: [], right: [] },
  );
  const [expandedInternal, setExpandedInternal] = useState<ExpandedState>(defaultExpanded ?? {});
  const expanded = expandedProp ?? expandedInternal;
  const setExpanded: (updater: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void = (
    updater,
  ) => {
    const next: ExpandedState =
      typeof updater === 'function'
        ? (updater as (prev: ExpandedState) => ExpandedState)(expanded)
        : updater;
    if (expandedProp === undefined) setExpandedInternal(next);
    onExpandedChange?.(next);
  };

  const isPrinting = usePrintMode();

  const enableRowSelectionResolved =
    typeof enableRowSelection === 'function'
      ? enableRowSelection
      : selectionMode !== 'none';

  const table = useReactTable<TData>({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
      columnPinning,
      expanded: isPrinting ? true : expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting,
    enableMultiSort,
    enableRowSelection: enableRowSelectionResolved,
    enableMultiRowSelection: selectionMode === 'multi',
    enableColumnPinning,
    ...(getSubRows !== undefined ? { getSubRows } : {}),
    ...(enableExpanding && getSubRows === undefined && renderExpandedRow !== undefined
      ? { getRowCanExpand: () => true }
      : {}),
    ...(enableExpanding ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(enableGlobalFilter || enableColumnFilters
      ? { getFilteredRowModel: getFilteredRowModel() }
      : {}),
    ...(getRowId !== undefined ? { getRowId } : {}),
    initialState: { pagination: { pageSize: initialPageSize, pageIndex: 0 } },
  });

  /* notify parent when selection changes */
  useEffect(() => {
    if (onRowSelectionChange === undefined) return;
    const selected = table.getSelectedRowModel().rows.map((r) => r.original);
    onRowSelectionChange(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageRows = isPrinting ? table.getFilteredRowModel().rows : table.getRowModel().rows;
  const skelCount = skeletonRows ?? table.getState().pagination.pageSize;
  const searchId = useId();

  const activeFilters = table.getState().columnFilters;
  const showChips =
    (showFilterChips ?? enableColumnFilters) && activeFilters.length > 0;

  /* ------------------------------- toolbar -------------------------------- */
  const showToolbar =
    enableGlobalFilter ||
    enableColumnVisibility ||
    enableColumnPinning ||
    toolbar?.left !== undefined ||
    toolbar?.right !== undefined;

  return (
    <div className={cn('flex flex-col gap-3', className)} data-print="expand">
      {showToolbar ? (
        <div className="flex flex-wrap items-center justify-between gap-2" data-print="hide">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {enableGlobalFilter ? (
              <Input
                id={searchId}
                aria-label="Search"
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="max-w-xs"
                inputSize="sm"
              />
            ) : null}
            {toolbar?.left}
          </div>
          <div className="flex items-center gap-2">
            {toolbar?.right}
            {enableColumnVisibility || enableColumnPinning ? (
              <ColumnsMenu table={table} enableColumnPinning={enableColumnPinning} />
            ) : null}
          </div>
        </div>
      ) : null}

      {showChips ? <FilterChips table={table} /> : null}

      <Table
        variant={variant}
        size={size}
        scrollable
        containerClassName={cn(maxHeight !== undefined && 'overflow-auto', containerClassName)}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        <TableHeader sticky={stickyHeader}>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const canSort =
                  enableSorting &&
                  header.column.getCanSort() &&
                  !INTERNAL_COLUMN_IDS.has(header.column.id);
                const sorted = header.column.getIsSorted();
                const sortIndex = header.column.getSortIndex();
                const isSelectCol = header.column.id === SELECT_COLUMN_ID;
                const isExpandCol = header.column.id === EXPAND_COLUMN_ID;
                const pin = pinningProps(header.column, 'header');
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      ...(header.getSize() !== 150 ? { width: header.getSize() } : {}),
                      ...pin.style,
                    }}
                    className={cn(
                      isSelectCol && 'w-9',
                      isExpandCol && 'w-8',
                      pin.className,
                    )}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {sorted === 'asc' ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                        )}
                        {enableMultiSort && sorted !== false && sortIndex >= 0 ? (
                          <span className="rounded bg-surface-muted px-1 text-[10px] font-semibold leading-4 text-foreground-muted">
                            {sortIndex + 1}
                          </span>
                        ) : null}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}

          {enableColumnFilters ? (
            <TableRow>
              {table.getVisibleLeafColumns().map((col) => {
                const pin = pinningProps(col, 'header');
                return (
                  <TableHead
                    key={`${col.id}-filter`}
                    className={cn('pt-0 pb-2', pin.className)}
                    style={pin.style}
                  >
                    {col.getCanFilter() && !INTERNAL_COLUMN_IDS.has(col.id) ? (
                      <FilterControl column={col} />
                    ) : null}
                  </TableHead>
                );
              })}
            </TableRow>
          ) : null}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: skelCount }).map((_, i) => (
              <TableRow key={`skel-${i}`}>
                {Array.from({ length: visibleColumnCount }).map((__, j) => (
                  <TableCell key={`skel-${i}-${j}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : pageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumnCount} className="p-0">
                {emptyState ?? defaultEmpty()}
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((row) => {
              const showCustomPanel =
                renderExpandedRow !== undefined &&
                (isPrinting || row.getIsExpanded());
              return (
                <Fragment key={row.id}>
                  <TableRow
                    selected={row.getIsSelected()}
                    onClick={
                      onRowClick === undefined ? undefined : (e) => onRowClick(row.original, e)
                    }
                    className={onRowClick !== undefined ? 'cursor-pointer' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const pin = pinningProps(cell.column, 'cell', row.getIsSelected());
                      return (
                        <TableCell
                          key={cell.id}
                          style={pin.style}
                          className={pin.className}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {showCustomPanel && renderExpandedRow !== undefined ? (
                    <TableRow className="bg-surface-muted/40 hover:bg-surface-muted/40">
                      <TableCell colSpan={visibleColumnCount} className="p-0">
                        <div className="px-4 py-3 sm:px-6 sm:py-4">
                          {renderExpandedRow(row)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      <DataTablePagination
        table={table}
        totalRows={totalRows}
        pageSizeOptions={pageSizeOptions}
        showSelectionCount={selectionMode !== 'none'}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pinning                                                                    */
/* -------------------------------------------------------------------------- */

interface PinResult {
  style: CSSProperties | undefined;
  className: string | undefined;
}

function pinningProps<TData>(
  column: Column<TData, unknown>,
  kind: 'header' | 'cell',
  rowIsSelected = false,
): PinResult {
  const pinned = column.getIsPinned();
  if (pinned === false) return { style: undefined, className: undefined };
  const isLastLeft = pinned === 'left' && column.getIsLastColumn('left');
  const isFirstRight = pinned === 'right' && column.getIsFirstColumn('right');

  const style: CSSProperties = {
    position: 'sticky',
    zIndex: kind === 'header' ? 3 : 1,
  };
  if (pinned === 'left') {
    style.left = `${column.getStart('left')}px`;
  } else if (pinned === 'right') {
    style.right = `${column.getAfter('right')}px`;
  }

  /*
   * Sticky cells need an opaque background. We override the row background
   * with bg-surface (cells) / bg-surface-muted (headers). For selected rows
   * we tint pinned cells to roughly match the row-selected highlight so
   * the seam doesn't look broken — accepts a small visual mismatch with
   * striped variants (cells override the stripe color).
   */
  const className = cn(
    kind === 'header' ? 'bg-surface-muted' : 'bg-surface',
    kind === 'cell' && rowIsSelected && 'bg-primary/10',
    isLastLeft && 'shadow-[inset_-1px_0_0_0_var(--color-border)]',
    isFirstRight && 'shadow-[inset_1px_0_0_0_var(--color-border)]',
  );

  return { style, className };
}

/* -------------------------------------------------------------------------- */
/*  Filter chip strip                                                          */
/* -------------------------------------------------------------------------- */

function FilterChips<TData>({ table }: { table: TanstackTable<TData> }) {
  const active = table.getState().columnFilters;
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border bg-surface-muted/30 p-2"
      data-table-filter-chips
      data-print="hide"
    >
      <span className="px-1 text-xs font-medium text-foreground-subtle">Filters</span>
      {active.map((f) => {
        const col = table.getColumn(f.id);
        if (col === undefined) return null;
        const label = getColumnLabel(col);
        const summary = summarizeFilterValue(col, f.value);
        return (
          <Badge
            key={f.id}
            variant="neutral"
            size="sm"
            className="border border-border bg-surface px-2 py-0.5"
          >
            <span className="font-medium">{label}</span>
            <span className="text-foreground-muted">{summary}</span>
            <button
              type="button"
              aria-label={`Clear ${label} filter`}
              onClick={() => col.setFilterValue(undefined)}
              className="-mr-1 ml-1 inline-flex h-4 w-4 items-center justify-center rounded text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </Badge>
        );
      })}
      <button
        type="button"
        onClick={() => table.resetColumnFilters()}
        className="ml-auto rounded px-2 py-0.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      >
        Clear all
      </button>
    </div>
  );
}

function summarizeFilterValue<TData>(col: Column<TData, unknown>, value: unknown): string {
  const variant = col.columnDef.meta?.filterVariant ?? 'text';
  if (variant === 'multi-select' && Array.isArray(value)) {
    if (value.length === 0) return '';
    return ` · ${value.length === 1 ? value[0] : `${value.length} selected`}`;
  }
  if (variant === 'select' && typeof value === 'string' && value !== '') {
    return ` · ${value}`;
  }
  if (variant === 'range' && Array.isArray(value)) {
    const [min, max] = value as [number | undefined, number | undefined];
    const lo = typeof min === 'number' && Number.isFinite(min) ? String(min) : '−∞';
    const hi = typeof max === 'number' && Number.isFinite(max) ? String(max) : '+∞';
    return ` · ${lo}–${hi}`;
  }
  if (
    variant === 'date-range' &&
    typeof value === 'object' &&
    value !== null
  ) {
    const { from, to } = value as { from?: Date | null; to?: Date | null };
    const lo = from instanceof Date ? from.toLocaleDateString() : '…';
    const hi = to instanceof Date ? to.toLocaleDateString() : '…';
    return ` · ${lo} → ${hi}`;
  }
  if (typeof value === 'string' && value !== '') return ` · "${value}"`;
  return '';
}

/* -------------------------------------------------------------------------- */
/*  Per-column filter input                                                    */
/* -------------------------------------------------------------------------- */

function FilterControl<TData>({ column }: { column: Column<TData, unknown> }) {
  const variant = column.columnDef.meta?.filterVariant ?? 'text';
  const label = getColumnLabel(column);

  if (variant === 'select') {
    const options = column.columnDef.meta?.filterOptions ?? [];
    const value = (column.getFilterValue() as string | undefined) ?? '';
    return (
      <Select
        aria-label={`Filter ${label}`}
        selectSize="sm"
        value={value}
        onChange={(e) =>
          column.setFilterValue(e.target.value === '' ? undefined : e.target.value)
        }
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  }

  if (variant === 'multi-select') {
    return <MultiSelectFilter column={column} label={label} />;
  }

  if (variant === 'range') {
    return <RangeFilter column={column} label={label} />;
  }

  if (variant === 'date-range') {
    return <DateRangeFilter column={column} label={label} />;
  }

  // text (default)
  return (
    <Input
      aria-label={`Filter ${label}`}
      inputSize="sm"
      placeholder="Filter…"
      value={(column.getFilterValue() as string | undefined) ?? ''}
      onChange={(e) =>
        column.setFilterValue(e.target.value === '' ? undefined : e.target.value)
      }
    />
  );
}

function MultiSelectFilter<TData>({
  column,
  label,
}: {
  column: Column<TData, unknown>;
  label: string;
}) {
  const optionsFromMeta = column.columnDef.meta?.filterOptions;
  const options = useMemo(() => {
    if (optionsFromMeta !== undefined) return optionsFromMeta;
    const facets = column.getFacetedUniqueValues();
    return Array.from(facets.keys())
      .filter((v): v is string => typeof v === 'string')
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [optionsFromMeta, column]);

  const value = (column.getFilterValue() as string[] | undefined) ?? [];
  const count = value.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          leftIcon={<FilterIcon className="h-3 w-3" />}
          rightIcon={<ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />}
          aria-label={`Filter ${label}`}
        >
          <span className="truncate">
            {count === 0 ? 'All' : count === 1 ? value[0] : `${count} selected`}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-start" className="min-w-[12rem]">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={checked}
              onCheckedChange={(next) => {
                const set = new Set(value);
                if (next) set.add(opt.value);
                else set.delete(opt.value);
                column.setFilterValue(set.size === 0 ? undefined : Array.from(set));
              }}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          );
        })}
        {count > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => column.setFilterValue(undefined)}>
              Clear
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RangeFilter<TData>({
  column,
  label,
}: {
  column: Column<TData, unknown>;
  label: string;
}) {
  const value = (column.getFilterValue() as [number | undefined, number | undefined] | undefined) ??
    [undefined, undefined];
  const [min, max] = value;

  const setRange = (next: [number | undefined, number | undefined]) => {
    const [lo, hi] = next;
    if (lo === undefined && hi === undefined) column.setFilterValue(undefined);
    else column.setFilterValue(next);
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        aria-label={`Min ${label}`}
        inputSize="sm"
        type="number"
        inputMode="decimal"
        placeholder="Min"
        value={min ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? undefined : Number(e.target.value);
          setRange([v, max]);
        }}
      />
      <span aria-hidden="true" className="text-foreground-subtle">
        –
      </span>
      <Input
        aria-label={`Max ${label}`}
        inputSize="sm"
        type="number"
        inputMode="decimal"
        placeholder="Max"
        value={max ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? undefined : Number(e.target.value);
          setRange([min, v]);
        }}
      />
    </div>
  );
}

function DateRangeFilter<TData>({
  column,
  label,
}: {
  column: Column<TData, unknown>;
  label: string;
}) {
  const value = column.getFilterValue() as { from?: Date | null; to?: Date | null } | undefined;
  const range: DateRange = {
    from: value?.from ?? null,
    to: value?.to ?? null,
  };
  return (
    <DateRangePicker
      aria-label={`Filter ${label}`}
      value={range}
      onChange={(next) => {
        if (next.from === null && next.to === null) column.setFilterValue(undefined);
        else column.setFilterValue({ from: next.from, to: next.to });
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Columns menu (visibility + pinning)                                        */
/* -------------------------------------------------------------------------- */

function ColumnsMenu<TData>({
  table,
  enableColumnPinning,
}: {
  table: TanstackTable<TData>;
  enableColumnPinning: boolean;
}) {
  const hideable = table
    .getAllLeafColumns()
    .filter((c) => c.getCanHide() && !INTERNAL_COLUMN_IDS.has(c.id));
  const pinnable = table
    .getAllLeafColumns()
    .filter((c) => c.getCanPin() && !INTERNAL_COLUMN_IDS.has(c.id));
  if (hideable.length === 0 && (!enableColumnPinning || pinnable.length === 0)) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" leftIcon={<Columns3 className="h-4 w-4" />}>
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end" className="min-w-[12rem]">
        {hideable.length > 0 ? (
          <>
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideable.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.getIsVisible()}
                onCheckedChange={(next) => col.toggleVisibility(next)}
              >
                {getColumnLabel(col)}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        ) : null}

        {enableColumnPinning && pinnable.length > 0 ? (
          <>
            {hideable.length > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel>Pin columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pinnable.map((col) => (
              <DropdownMenuSub key={col.id}>
                <DropdownMenuSubTrigger>
                  <span className="flex-1">{getColumnLabel(col)}</span>
                  {col.getIsPinned() === 'left' ? (
                    <Badge variant="primary" size="sm">
                      L
                    </Badge>
                  ) : col.getIsPinned() === 'right' ? (
                    <Badge variant="primary" size="sm">
                      R
                    </Badge>
                  ) : null}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => col.pin('left')}>
                    <Pin className="h-3.5 w-3.5" />
                    Pin left
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => col.pin('right')}>
                    <Pin className="h-3.5 w-3.5 rotate-180" />
                    Pin right
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => col.pin(false)}>
                    <PinOff className="h-3.5 w-3.5" />
                    Unpin
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                 */
/* -------------------------------------------------------------------------- */

function DataTablePagination<TData>({
  table,
  totalRows,
  pageSizeOptions,
  showSelectionCount,
}: {
  table: TanstackTable<TData>;
  totalRows: number;
  pageSizeOptions: number[];
  showSelectionCount: boolean;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div
      data-print="hide"
      className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground-muted"
    >
      <div className="flex items-center gap-3">
        {showSelectionCount && selectedCount > 0 ? (
          <span>
            {selectedCount} of {totalRows} selected
          </span>
        ) : (
          <span>
            {totalRows === 0 ? '0' : `${start}–${end}`} of {totalRows}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select
            selectSize="sm"
            className="w-auto pr-8"
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </label>
        <span className="px-1">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </span>
        <IconButton
          aria-label="Previous page"
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </IconButton>
        <IconButton
          aria-label="Next page"
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
