import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/primitives/IconButton';
import { usePagination, type PaginationItem } from './usePagination';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  ref?: Ref<HTMLElement>;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  ariaLabel?: string;
}

export function Pagination({
  ref,
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  ariaLabel = 'Pagination',
  className,
  ...rest
}: PaginationProps) {
  const items = usePagination({ page, totalPages, siblingCount, boundaryCount });
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn('flex items-center gap-1', className)}
      {...rest}
    >
      <IconButton
        aria-label="Previous page"
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </IconButton>

      <ul className="flex items-center gap-1">
        {items.map((it, i) => (
          <li key={`${it}-${i}`}>
            {it === 'ellipsis-start' || it === 'ellipsis-end' ? (
              <span
                role="presentation"
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center text-foreground-subtle"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <button
                type="button"
                aria-label={`Go to page ${it}`}
                aria-current={it === page ? 'page' : undefined}
                onClick={() => onPageChange(it)}
                className={cn(
                  'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  it === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-surface text-foreground hover:bg-surface-muted',
                )}
              >
                {it}
              </button>
            )}
          </li>
        ))}
      </ul>

      <IconButton
        aria-label="Next page"
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </IconButton>
    </nav>
  );
}

export type { PaginationItem };
export { usePagination };
