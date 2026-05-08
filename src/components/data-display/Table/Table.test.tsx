import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
} from './Table';

function renderTable(props: Parameters<typeof Table>[0] = {}) {
  return render(
    <Table {...props}>
      <TableCaption>Cap</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada</TableCell>
          <TableCell>ada@x.com</TableCell>
        </TableRow>
        <TableRow selected>
          <TableCell>Grace</TableCell>
          <TableCell>grace@x.com</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>2 users</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  );
}

describe('Table', () => {
  it('renders semantic table structure', () => {
    renderTable();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getByText('Cap')).toBeInTheDocument();
  });

  it.each([
    ['default', null],
    ['striped', null],
    ['bordered', 'border-border'],
  ] as const)('variant=%s renders', (variant, signal) => {
    renderTable({ variant });
    const table = screen.getByRole('table');
    if (signal !== null) expect(table).toHaveClass(signal);
  });

  it('selected row sets data-state', () => {
    renderTable();
    const rows = screen.getAllByRole('row');
    expect(rows[2]).toHaveAttribute('data-state', 'selected');
  });

  it('sticky header adds class', () => {
    render(
      <Table>
        <TableHeader sticky data-testid="thead">
          <TableRow>
            <TableHead>X</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId('thead')).toHaveClass('sticky');
  });

  it('size=dense applies tighter padding to cells', () => {
    render(
      <Table size="dense">
        <TableBody>
          <TableRow>
            <TableCell data-testid="cell">x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId('cell')).toHaveClass('py-1.5');
  });
});
