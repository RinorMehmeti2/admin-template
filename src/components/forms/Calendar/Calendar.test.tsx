import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Calendar } from './Calendar';

const may2026 = new Date(2026, 4, 1);

function ControlledCalendar(props: Partial<Parameters<typeof Calendar>[0]> = {}) {
  const [month, setMonth] = useState(may2026);
  const [value, setValue] = useState<Date | undefined>(undefined);
  return (
    <Calendar month={month} onMonthChange={setMonth} value={value} onChange={setValue} {...props} />
  );
}

describe('Calendar — rendering', () => {
  it('renders the month label', () => {
    render(<Calendar month={may2026} />);
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  it('renders a grid with role="grid"', () => {
    render(<Calendar month={may2026} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders 7 column headers', () => {
    render(<Calendar month={may2026} />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });

  it('weekStartsOn=1 puts Monday first', () => {
    render(<Calendar month={may2026} weekStartsOn={1} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent(/M/);
  });

  it('weekStartsOn=0 puts Sunday first', () => {
    render(<Calendar month={may2026} weekStartsOn={0} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent(/S/);
  });

  it('renders all days of the month', () => {
    render(<Calendar month={may2026} />);
    // May has 31 days. Each must be present as a gridcell.
    for (let day = 1; day <= 31; day++) {
      expect(
        screen.getByRole('gridcell', { name: new RegExp(`May ${day}(st|nd|rd|th)?,? 2026`) }),
      ).toBeInTheDocument();
    }
  });
});

describe('Calendar — selection', () => {
  it('clicking a day fires onChange with that date', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar month={may2026} onChange={onChange} />);
    await user.click(screen.getByRole('gridcell', { name: /May 9th, 2026/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(4);
    expect(arg.getDate()).toBe(9);
  });

  it('selected day has aria-selected="true"', () => {
    render(<Calendar month={may2026} value={new Date(2026, 4, 9)} />);
    const cell = screen.getByRole('gridcell', { name: /May 9th, 2026/ });
    expect(cell).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Calendar — disabled / bounds', () => {
  it('does not fire onChange for disabled days', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar month={may2026} onChange={onChange} minDate={new Date(2026, 4, 10)} />);
    const disabledCell = screen.getByRole('gridcell', { name: /May 5th, 2026/ });
    expect(disabledCell).toHaveAttribute('aria-disabled', 'true');
    expect(disabledCell).toBeDisabled();
    await user.click(disabledCell);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('isDateDisabled callback is honored', () => {
    render(
      <Calendar month={may2026} isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6} />,
    );
    // May 9, 2026 is a Saturday → disabled.
    expect(screen.getByRole('gridcell', { name: /May 9th, 2026/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    // May 11, 2026 is a Monday → enabled.
    expect(screen.getByRole('gridcell', { name: /May 11th, 2026/ })).not.toHaveAttribute(
      'aria-disabled',
    );
  });
});

describe('Calendar — month navigation', () => {
  it('clicking prev month fires onMonthChange', async () => {
    const onMonthChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar month={may2026} onMonthChange={onMonthChange} />);
    await user.click(screen.getByLabelText('Previous month'));
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    const arg = onMonthChange.mock.calls[0]![0] as Date;
    expect(arg.getMonth()).toBe(3); // April
  });

  it('clicking next month fires onMonthChange', async () => {
    const onMonthChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar month={may2026} onMonthChange={onMonthChange} />);
    await user.click(screen.getByLabelText('Next month'));
    const arg = onMonthChange.mock.calls[0]![0] as Date;
    expect(arg.getMonth()).toBe(5); // June
  });

  it('PageDown delegates to month change', async () => {
    const onMonthChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar month={may2026} onMonthChange={onMonthChange} />);
    // Focus a real cell first, then press PageDown.
    const cell = screen.getByRole('gridcell', { name: /May 1st, 2026/ });
    cell.focus();
    await user.keyboard('{PageDown}');
    expect(onMonthChange).toHaveBeenCalledTimes(1);
  });
});

describe('Calendar — keyboard navigation through the grid', () => {
  it('ArrowRight moves focus to the next day', async () => {
    const user = userEvent.setup();
    render(<ControlledCalendar />);
    const start = screen.getByRole('gridcell', { name: /May 1st, 2026/ });
    start.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('gridcell', { name: /May 2nd, 2026/ }));
  });

  it('ArrowDown moves focus by one week', async () => {
    const user = userEvent.setup();
    render(<ControlledCalendar />);
    screen.getByRole('gridcell', { name: /May 1st, 2026/ }).focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('gridcell', { name: /May 8th, 2026/ }));
  });

  it('Enter selects the focused day', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar month={may2026} onChange={onChange} />);
    const cell = screen.getByRole('gridcell', { name: /May 14th, 2026/ });
    cell.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('Calendar — a11y', () => {
  it('has no a11y violations (default + selected)', async () => {
    const { container } = render(<Calendar month={may2026} value={new Date(2026, 4, 9)} />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});

describe('Calendar — range highlight', () => {
  it('marks both edges and intermediate days', () => {
    render(
      <Calendar
        month={may2026}
        highlightRange={{ from: new Date(2026, 4, 5), to: new Date(2026, 4, 9) }}
      />,
    );
    expect(screen.getByRole('gridcell', { name: /May 5th, 2026/ })).toHaveAttribute(
      'data-range-edge',
      'true',
    );
    expect(screen.getByRole('gridcell', { name: /May 9th, 2026/ })).toHaveAttribute(
      'data-range-edge',
      'true',
    );
    expect(screen.getByRole('gridcell', { name: /May 7th, 2026/ })).toHaveAttribute(
      'data-in-range',
      'true',
    );
  });
});
