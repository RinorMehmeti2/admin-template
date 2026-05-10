import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { DateRangePicker, type DateRange } from './DateRangePicker';

function ControlledRange({ onChange }: { onChange?: (r: DateRange) => void }) {
  const [v, setV] = useState<DateRange>({ from: null, to: null });
  return (
    <DateRangePicker
      value={v}
      onChange={(next) => {
        setV(next);
        onChange?.(next);
      }}
      defaultValue={{ from: new Date(2026, 4, 5), to: new Date(2026, 4, 9) }}
      placeholderFrom="From"
      placeholderTo="To"
    />
  );
}

describe('DateRangePicker — base', () => {
  it('renders two inputs', () => {
    render(<DateRangePicker placeholderFrom="From" placeholderTo="To" />);
    expect(screen.getByPlaceholderText('From')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('To')).toBeInTheDocument();
  });

  it('clicking an input opens the dialog', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker placeholderFrom="From" placeholderTo="To" />);
    await user.click(screen.getByPlaceholderText('From'));
    expect(screen.getByRole('dialog', { name: /choose date range/i })).toBeInTheDocument();
  });

  it('renders two calendars in the dialog', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 4, 1), to: null }}
        placeholderFrom="From"
        placeholderTo="To"
      />,
    );
    await user.click(screen.getByPlaceholderText('From'));
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  it('Escape closes the dialog', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker placeholderFrom="From" placeholderTo="To" />);
    await user.click(screen.getByPlaceholderText('From'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('DateRangePicker — selection', () => {
  it('first click sets from, second click sets to + closes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 4, 1), to: new Date(2026, 4, 1) }}
        onChange={onChange}
        placeholderFrom="From"
        placeholderTo="To"
      />,
    );
    await user.click(screen.getByPlaceholderText('From'));

    // First click — May 5 (only the left "May 2026" calendar contains it).
    const may5 = screen.getAllByRole('gridcell', { name: /May 5th, 2026/ });
    await user.click(may5[0]!);
    expect(onChange).toHaveBeenLastCalledWith({
      from: expect.any(Date),
      to: null,
    });

    // Second click — May 12.
    const may12 = screen.getAllByRole('gridcell', { name: /May 12th, 2026/ });
    await user.click(may12[0]!);
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(lastCall.from?.getDate()).toBe(5);
    expect(lastCall.to?.getDate()).toBe(12);

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('clicking before from resets the from anchor', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlledRange onChange={onChange} />);

    await user.click(screen.getByPlaceholderText('From'));

    // First, set from = May 15.
    await user.click(screen.getAllByRole('gridcell', { name: /May 15th, 2026/ })[0]!);
    onChange.mockClear();

    // Now click May 3 — it's before from, so range resets to from=May 3 with to=null.
    await user.click(screen.getAllByRole('gridcell', { name: /May 3rd, 2026/ })[0]!);
    expect(onChange).toHaveBeenLastCalledWith({
      from: expect.any(Date),
      to: null,
    });
    const arg = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(arg.from?.getDate()).toBe(3);
    expect(arg.to).toBeNull();
  });
});

describe('DateRangePicker — presets', () => {
  it('renders the default preset list', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker placeholderFrom="From" placeholderTo="To" />);
    await user.click(screen.getByPlaceholderText('From'));
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yesterday' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last 30 days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'This month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last month' })).toBeInTheDocument();
  });

  it('clicking a preset commits the range and closes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DateRangePicker onChange={onChange} placeholderFrom="From" placeholderTo="To" />);
    await user.click(screen.getByPlaceholderText('From'));
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as DateRange;
    expect(arg.from).not.toBeNull();
    expect(arg.to).not.toBeNull();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('hidePresets removes the sidebar', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker hidePresets placeholderFrom="From" placeholderTo="To" />);
    await user.click(screen.getByPlaceholderText('From'));
    expect(screen.queryByRole('button', { name: 'Today' })).toBeNull();
  });

  it('custom presets override the default list', async () => {
    const user = userEvent.setup();
    const customPresets = [
      {
        label: 'Q1 2026',
        getRange: () => ({ from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) }),
      },
    ];
    render(<DateRangePicker presets={customPresets} placeholderFrom="From" placeholderTo="To" />);
    await user.click(screen.getByPlaceholderText('From'));
    expect(screen.getByRole('button', { name: 'Q1 2026' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Today' })).toBeNull();
  });
});

describe('DateRangePicker — a11y', () => {
  it('has no a11y violations (closed + open)', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateRangePicker placeholderFrom="From" placeholderTo="To" />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
    await user.click(screen.getByPlaceholderText('From'));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});

describe('DateRangePicker — bounds', () => {
  it('respects minDate/maxDate', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 4, 1), to: null }}
        minDate={new Date(2026, 4, 5)}
        maxDate={new Date(2026, 4, 20)}
        placeholderFrom="From"
        placeholderTo="To"
      />,
    );
    await user.click(screen.getByPlaceholderText('From'));
    const may1 = screen.getAllByRole('gridcell', { name: /May 1st, 2026/ })[0]!;
    expect(may1).toHaveAttribute('aria-disabled', 'true');
  });
});
