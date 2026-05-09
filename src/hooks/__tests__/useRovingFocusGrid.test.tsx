import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  RovingFocusGrid,
  useRovingFocusGridItem,
  type PageNavDirection,
} from '@/hooks/useRovingFocusGrid';

interface CellProps {
  row: number;
  col: number;
  label: string;
}

function Cell({ row, col, label }: CellProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { tabIndex, onKeyDown, onFocus } = useRovingFocusGridItem(row, col, ref);
  return (
    <button
      ref={ref}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      data-row={row}
      data-col={col}
    >
      {label}
    </button>
  );
}

interface GridProps {
  rows?: number;
  cols?: number;
  loop?: boolean;
  defaultRow?: number;
  defaultCol?: number;
  onPageNavigate?: (direction: PageNavDirection, currentRow: number, currentCol: number) => void;
}

function Grid({
  rows = 3,
  cols = 3,
  loop = false,
  defaultRow = 0,
  defaultCol = 0,
  onPageNavigate,
}: GridProps) {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(<Cell key={`${r}-${c}`} row={r} col={c} label={`r${r}c${c}`} />);
    }
  }
  return (
    <RovingFocusGrid
      loop={loop}
      defaultRow={defaultRow}
      defaultCol={defaultCol}
      {...(onPageNavigate !== undefined
        ? { onPageNavigate: (d, r, c) => onPageNavigate(d, r, c) }
        : {})}
    >
      {cells}
    </RovingFocusGrid>
  );
}

describe('useRovingFocusGrid', () => {
  it('first cell gets tabindex=0, others -1', () => {
    render(<Grid />);
    expect(screen.getByText('r0c0')).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('r0c1')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByText('r1c0')).toHaveAttribute('tabindex', '-1');
  });

  it('respects defaultRow / defaultCol', () => {
    render(<Grid defaultRow={1} defaultCol={2} />);
    expect(screen.getByText('r1c2')).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('r0c0')).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight moves column +1', async () => {
    render(<Grid />);
    screen.getByText('r0c0').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('r0c1'));
    expect(screen.getByText('r0c1')).toHaveAttribute('tabindex', '0');
  });

  it('ArrowLeft moves column -1', async () => {
    render(<Grid />);
    screen.getByText('r0c2').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByText('r0c1'));
  });

  it('ArrowDown moves row +1', async () => {
    render(<Grid />);
    screen.getByText('r0c1').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByText('r1c1'));
  });

  it('ArrowUp moves row -1', async () => {
    render(<Grid />);
    screen.getByText('r2c1').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByText('r1c1'));
  });

  it('does not loop horizontally by default at end of row', async () => {
    render(<Grid />);
    screen.getByText('r0c2').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('r0c2'));
  });

  it('loops horizontally when loop=true', async () => {
    render(<Grid loop />);
    screen.getByText('r0c2').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('r0c0'));
  });

  it('does not loop vertically by default at last row', async () => {
    render(<Grid />);
    screen.getByText('r2c0').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByText('r2c0'));
  });

  it('Home jumps to start of current row', async () => {
    render(<Grid />);
    screen.getByText('r1c2').focus();
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByText('r1c0'));
  });

  it('End jumps to end of current row', async () => {
    render(<Grid />);
    screen.getByText('r1c0').focus();
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByText('r1c2'));
  });

  it('Ctrl+Home jumps to first cell', async () => {
    render(<Grid />);
    screen.getByText('r2c2').focus();
    await userEvent.keyboard('{Control>}{Home}{/Control}');
    expect(document.activeElement).toBe(screen.getByText('r0c0'));
  });

  it('Ctrl+End jumps to last cell', async () => {
    render(<Grid />);
    screen.getByText('r0c0').focus();
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(document.activeElement).toBe(screen.getByText('r2c2'));
  });

  it('PageDown delegates with direction=1 and current coords', async () => {
    const onPage = vi.fn();
    render(<Grid onPageNavigate={onPage} />);
    screen.getByText('r1c2').focus();
    await userEvent.keyboard('{PageDown}');
    expect(onPage).toHaveBeenCalledWith(1, 1, 2);
  });

  it('PageUp delegates with direction=-1', async () => {
    const onPage = vi.fn();
    render(<Grid onPageNavigate={onPage} />);
    screen.getByText('r0c0').focus();
    await userEvent.keyboard('{PageUp}');
    expect(onPage).toHaveBeenCalledWith(-1, 0, 0);
  });

  it('focusing a cell directly updates the active cell', () => {
    render(<Grid />);
    act(() => {
      screen.getByText('r2c1').focus();
    });
    expect(screen.getByText('r2c1')).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('r0c0')).toHaveAttribute('tabindex', '-1');
  });
});
