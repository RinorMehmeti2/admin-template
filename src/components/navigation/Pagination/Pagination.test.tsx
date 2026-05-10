import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';
import { usePagination } from './usePagination';
import { runAxe } from '@/test-utils/a11y';

describe('usePagination', () => {
  it('returns just the pages when total is small', () => {
    expect(usePagination({ page: 1, totalPages: 5 })).toEqual([1, 2, 3, 4, 5]);
  });

  it('inserts ellipsis-end when current is near the start', () => {
    const items = usePagination({ page: 2, totalPages: 20 });
    expect(items[0]).toBe(1);
    expect(items).toContain('ellipsis-end');
    expect(items[items.length - 1]).toBe(20);
  });

  it('inserts ellipsis-start when current is near the end', () => {
    const items = usePagination({ page: 19, totalPages: 20 });
    expect(items).toContain('ellipsis-start');
    expect(items[0]).toBe(1);
  });

  it('inserts both ellipses when current is in the middle', () => {
    const items = usePagination({ page: 10, totalPages: 20 });
    expect(items).toContain('ellipsis-start');
    expect(items).toContain('ellipsis-end');
  });

  it('respects siblingCount', () => {
    const items = usePagination({ page: 10, totalPages: 20, siblingCount: 2 });
    // pages 8,9,10,11,12 should all be present
    [8, 9, 10, 11, 12].forEach((p) => expect(items).toContain(p));
  });

  it('returns [] for totalPages=0', () => {
    expect(usePagination({ page: 1, totalPages: 0 })).toEqual([]);
  });
});

describe('Pagination', () => {
  it('renders prev/next + page list', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('disables prev on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();
  });

  it('disables next on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('clicking a page fires onPageChange', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('prev / next call onPageChange with adjacent page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <Pagination page={3} totalPages={20} onPageChange={() => undefined} />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
