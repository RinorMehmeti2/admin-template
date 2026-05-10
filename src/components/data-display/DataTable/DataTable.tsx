import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Inbox,
  Search,
} from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { usePrintMode } from '@/hooks/usePrintMode';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Skeleton } from '@/components/primitives/Skeleton';
import { Input } from '@/components/forms/Input';
import { Checkbox } from '@/components/forms/Checkbox';
import { Select } from '@/components/forms/Select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
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

/*
 * Generic, headless-state-driven DataTable. State lives in @tanstack/react-table
 * — we compose our own visual primitives on top. URL-state sync is intentionally
 * not handled here; consumers can lift state with controlled props if they
 * need it (planned: see TODO at bottom of file).
 */

export type { ColumnDef, Row, SortingState, RowSelectionState, VisibilityState };

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

  /* Filtering */
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  searchPlaceholder?: string;

  /* Selection */
  enableRowSelection?: boolean | 'single' | 'multi';
  onRowSelectionChange?: (rows: TData[]) => void;

  /* Visibility */
  enableColumnVisibility?: boolean;

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

function buildSelectColumn<TData>(mode: 'single' | 'multi'): ColumnDef<TData, unknown> {
  return {
    id: SELECT_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
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
        // Don't propagate so onRowClick on parent doesn't fire.
        onClick={(e) => e.stopPropagation()}
      />
    ),
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

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  enableSorting = true,
  enableMultiSort = false,
  enableGlobalFilter = true,
  enableColumnFilters = false,
  searchPlaceholder = 'Search…',
  enableRowSelection = false,
  onRowSelectionChange,
  enableColumnVisibility = true,
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
      : enableRowSelection === true || enableRowSelection === 'multi'
        ? 'multi'
        : 'single';

  const allColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (selectionMode === 'none') return columns;
    return [buildSelectColumn<TData>(selectionMode), ...columns];
  }, [columns, selectionMode]);

  /* ------------------------------ table state ----------------------------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable<TData>({
    data,
    columns: allColumns,
    state: { sorting, columnFilters, globalFilter, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting,
    enableMultiSort,
    enableRowSelection: selectionMode !== 'none',
    enableMultiRowSelection: selectionMode === 'multi',
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
  const isPrinting = usePrintMode();
  // While printing, render every filtered row instead of just the active page.
  const pageRows = isPrinting
    ? table.getFilteredRowModel().rows
    : table.getRowModel().rows;
  const skelCount = skeletonRows ?? table.getState().pagination.pageSize;
  const searchId = useId();

  /* ------------------------------- toolbar -------------------------------- */
  const showToolbar =
    enableGlobalFilter ||
    enableColumnVisibility ||
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
            {enableColumnVisibility ? <ColumnVisibilityMenu table={table} /> : null}
          </div>
        </div>
      ) : null}

      <Table
        variant={variant}
        size={size}
        scrollable
        containerClassName={cn(
          maxHeight !== undefined && 'overflow-auto',
          containerClassName,
        )}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        <TableHeader sticky={stickyHeader}>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const canSort =
                  enableSorting &&
                  header.column.getCanSort() &&
                  header.column.id !== SELECT_COLUMN_ID;
                const sorted = header.column.getIsSorted();
                const isSelectCol = header.column.id === SELECT_COLUMN_ID;
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() === 150 ? undefined : header.getSize() }}
                    className={isSelectCol ? 'w-9' : undefined}
                    aria-sort={
                      sorted === 'asc'
                        ? 'ascending'
                        : sorted === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                      >
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {sorted === 'asc' ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                        )}
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
              {table.getVisibleLeafColumns().map((col) => (
                <TableHead key={`${col.id}-filter`} className="pt-0 pb-2">
                  {col.getCanFilter() && col.id !== SELECT_COLUMN_ID ? (
                    <Input
                      aria-label={`Filter ${col.id}`}
                      inputSize="sm"
                      placeholder="Filter…"
                      value={(col.getFilterValue() as string | undefined) ?? ''}
                      onChange={(e) => col.setFilterValue(e.target.value)}
                    />
                  ) : null}
                </TableHead>
              ))}
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
            pageRows.map((row) => (
              <TableRow
                key={row.id}
                selected={row.getIsSelected()}
                onClick={
                  onRowClick === undefined ? undefined : (e) => onRowClick(row.original, e)
                }
                className={onRowClick !== undefined ? 'cursor-pointer' : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
/*  Subcomponents                                                             */
/* -------------------------------------------------------------------------- */

function ColumnVisibilityMenu<TData>({ table }: { table: TanstackTable<TData> }) {
  const hideable = table
    .getAllLeafColumns()
    .filter((c) => c.getCanHide() && c.id !== SELECT_COLUMN_ID);
  if (hideable.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" leftIcon={<Columns3 className="h-4 w-4" />}>
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((col) => {
          const header = col.columnDef.header;
          const label =
            typeof header === 'string' && header.length > 0 ? header : col.id;
          return (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={col.getIsVisible()}
              onCheckedChange={(next) => col.toggleVisibility(next)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
