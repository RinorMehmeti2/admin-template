export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

export interface UsePaginationOptions {
  page: number;
  totalPages: number;
  /** Pages on each side of the current page. Default: 1. */
  siblingCount?: number;
  /** Pages at each boundary (start/end). Default: 1. */
  boundaryCount?: number;
}

/**
 * Returns an ordered list of page numbers and ellipsis tokens, e.g.
 *   [1, 'ellipsis-start', 7, 8, 9, 'ellipsis-end', 25].
 *
 * Caller decides whether ellipsis tokens render as buttons (jump) or static text.
 */
export function usePagination({
  page,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
}: UsePaginationOptions): PaginationItem[] {
  if (totalPages <= 0) return [];

  // If everything fits without ellipsis, just show every page.
  // Threshold = boundaries*2 + siblings*2 + current + 2 ellipsis slots.
  const minToEllipsize = boundaryCount * 2 + siblingCount * 2 + 3;
  if (totalPages <= minToEllipsize) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  // Boundary pages
  for (let i = 1; i <= Math.min(boundaryCount, totalPages); i += 1) {
    pages.add(i);
  }
  for (let i = Math.max(1, totalPages - boundaryCount + 1); i <= totalPages; i += 1) {
    pages.add(i);
  }

  // Siblings around current page
  for (
    let i = Math.max(1, page - siblingCount);
    i <= Math.min(totalPages, page + siblingCount);
    i += 1
  ) {
    pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: PaginationItem[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const cur = sorted[i]!;
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (cur - prev > 1) {
        // ellipsis-start when before the current page block, ellipsis-end after
        result.push(prev < page ? 'ellipsis-start' : 'ellipsis-end');
      }
    }
    result.push(cur);
  }
  return result;
}
