import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { runAxe } from '@/test-utils/a11y';

interface Row {
  id: number;
  name: string;
  email: string;
  age: number;
}

const ROWS: Row[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@x.com', age: 36 },
  { id: 2, name: 'Grace Hopper', email: 'grace@x.com', age: 85 },
  { id: 3, name: 'Linus Torvalds', email: 'linus@x.com', age: 54 },
  { id: 4, name: 'Margaret Hamilton', email: 'margaret@x.com', age: 87 },
];

const COLUMNS: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'age', header: 'Age' },
];

describe('DataTable', () => {
  it('renders rows and headers', () => {
    render(<DataTable columns={COLUMNS} data={ROWS} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<DataTable columns={COLUMNS} data={[]} />);
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument();
  });

  it('shows skeleton rows when loading', () => {
    const { container } = render(
      <DataTable columns={COLUMNS} data={[]} isLoading skeletonRows={2} />,
    );
    expect(container.querySelectorAll('[aria-hidden="true"].animate-pulse').length).toBeGreaterThan(
      0,
    );
  });

  it('global search filters rows', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={ROWS} />);
    await user.type(screen.getByLabelText('Search'), 'Grace');
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
  });

  it('clicking sortable header toggles asc/desc', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={ROWS} />);
    const nameHeader = screen.getByRole('button', { name: /Name/i });
    await user.click(nameHeader);
    const headerCell = nameHeader.closest('th');
    expect(headerCell).toHaveAttribute('aria-sort', 'ascending');
    await user.click(nameHeader);
    expect(nameHeader.closest('th')).toHaveAttribute('aria-sort', 'descending');
  });

  it('row selection multi: select-all checks all visible rows', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DataTable
        columns={COLUMNS}
        data={ROWS}
        enableRowSelection="multi"
        onRowSelectionChange={onChange}
      />,
    );
    const all = screen.getByLabelText('Select all rows on page');
    await user.click(all);
    const lastCall = onChange.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    expect(lastCall![0]).toHaveLength(ROWS.length);
  });

  it('row click handler fires when set', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable columns={COLUMNS} data={ROWS} onRowClick={onRowClick} />);
    await user.click(screen.getByText('Ada Lovelace'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]![0]).toEqual(ROWS[0]);
  });

  it('row click does NOT fire when clicking the row checkbox', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={COLUMNS}
        data={ROWS}
        enableRowSelection="multi"
        onRowClick={onRowClick}
      />,
    );
    await user.click(screen.getByLabelText('Select row 1'));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('pagination respects pageSize', () => {
    render(<DataTable columns={COLUMNS} data={ROWS} pageSize={2} />);
    // Only first 2 rows shown
    const tbody = screen.getByRole('table').querySelector('tbody');
    expect(within(tbody as HTMLElement).queryByText('Linus Torvalds')).toBeNull();
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  it('next page advances', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={ROWS} pageSize={2} />);
    await user.click(screen.getByLabelText('Next page'));
    expect(screen.getByText('Linus Torvalds')).toBeInTheDocument();
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
  });

  it('column visibility menu hides a column', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={COLUMNS} data={ROWS} />);
    await user.click(screen.getByRole('button', { name: /Columns/i }));
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Email' });
    await user.click(item);
    expect(screen.queryByText('ada@x.com')).toBeNull();
  });

  it('has no a11y violations (rows + selection enabled)', async () => {
    const { container } = render(
      <DataTable columns={COLUMNS} data={ROWS} enableRowSelection="multi" />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('has no a11y violations (empty state)', async () => {
    const { container } = render(<DataTable columns={COLUMNS} data={[]} />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
