import {
  createContext,
  useContext,
  useMemo,
  type HTMLAttributes,
  type Ref,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/*
 * Presentational table primitive. Headless data hooks (sorting, paging) live
 * in the DataTable wrapper — Table itself is just structure + theming.
 */

const tableStyles = cva('w-full caption-bottom text-sm text-foreground', {
  variants: {
    variant: {
      default: '',
      striped: '',
      bordered: 'border border-border',
    },
    size: {
      dense: '',
      default: '',
      comfortable: '',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

type TableVariant = NonNullable<VariantProps<typeof tableStyles>['variant']>;
type TableSize = NonNullable<VariantProps<typeof tableStyles>['size']>;

interface TableContextValue {
  variant: TableVariant;
  size: TableSize;
  hover: boolean;
}

const TableContext = createContext<TableContextValue>({
  variant: 'default',
  size: 'default',
  hover: false,
});

export interface TableProps
  extends TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableStyles> {
  ref?: Ref<HTMLTableElement>;
  /** Highlight rows on hover. Default: true. */
  hover?: boolean;
  /** Wraps the table in an overflow-auto container. Default: true. */
  scrollable?: boolean;
  /** className passed to the scroll container (when scrollable). */
  containerClassName?: string;
}

export function Table({
  ref,
  className,
  variant,
  size,
  hover = true,
  scrollable = true,
  containerClassName,
  ...rest
}: TableProps) {
  const v: TableVariant = variant ?? 'default';
  const s: TableSize = size ?? 'default';
  const ctx = useMemo<TableContextValue>(() => ({ variant: v, size: s, hover }), [v, s, hover]);

  const tableEl = (
    <table
      ref={ref}
      className={cn(tableStyles({ variant: v, size: s }), className)}
      {...rest}
    />
  );

  const wrapped = scrollable ? (
    <div
      className={cn(
        'w-full overflow-auto rounded-md',
        v !== 'bordered' && 'border border-border',
        containerClassName,
      )}
    >
      {tableEl}
    </div>
  ) : (
    tableEl
  );

  return <TableContext.Provider value={ctx}>{wrapped}</TableContext.Provider>;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
  /** Stick the header to the top of the scroll container. */
  sticky?: boolean;
}

export function TableHeader({ ref, className, sticky, ...rest }: TableHeaderProps) {
  return (
    <thead
      ref={ref}
      className={cn(
        'bg-surface-muted/60 text-foreground-muted [&_tr]:border-b [&_tr]:border-border',
        sticky === true && 'sticky top-0 z-10',
        className,
      )}
      {...rest}
    />
  );
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

export function TableBody({ ref, className, ...rest }: TableBodyProps) {
  const { variant } = useContext(TableContext);
  return (
    <tbody
      ref={ref}
      className={cn(
        '[&_tr:last-child]:border-0',
        variant === 'striped' && '[&_tr:nth-child(even)]:bg-surface-muted/40',
        className,
      )}
      {...rest}
    />
  );
}

export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

export function TableFooter({ ref, className, ...rest }: TableFooterProps) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-border bg-surface-muted/40 font-medium',
        className,
      )}
      {...rest}
    />
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  ref?: Ref<HTMLTableRowElement>;
  /** Visual selected state. */
  selected?: boolean;
}

export function TableRow({ ref, className, selected, ...rest }: TableRowProps) {
  const { hover } = useContext(TableContext);
  return (
    <tr
      ref={ref}
      data-state={selected === true ? 'selected' : undefined}
      className={cn(
        'border-b border-border transition-colors',
        hover && 'hover:bg-surface-muted/50',
        selected === true && 'bg-primary/10 hover:bg-primary/15',
        className,
      )}
      {...rest}
    />
  );
}

const cellPad = {
  dense: 'px-3 py-1.5',
  default: 'px-4 py-2.5',
  comfortable: 'px-5 py-4',
} as const;

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
}

export function TableHead({ ref, className, ...rest }: TableHeadProps) {
  const { size } = useContext(TableContext);
  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        cellPad[size],
        'text-left align-middle text-xs font-semibold uppercase tracking-wide',
        className,
      )}
      {...rest}
    />
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
}

export function TableCell({ ref, className, ...rest }: TableCellProps) {
  const { size } = useContext(TableContext);
  return (
    <td
      ref={ref}
      className={cn(cellPad[size], 'align-middle', className)}
      {...rest}
    />
  );
}

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  ref?: Ref<HTMLTableCaptionElement>;
}

export function TableCaption({ ref, className, ...rest }: TableCaptionProps) {
  return (
    <caption
      ref={ref}
      className={cn('mt-3 text-sm text-foreground-muted', className)}
      {...rest}
    />
  );
}
