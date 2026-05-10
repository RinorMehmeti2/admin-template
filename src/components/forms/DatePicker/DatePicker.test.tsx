import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { DatePicker } from './DatePicker';

const may2026 = new Date(2026, 4, 9);

describe('DatePicker — base', () => {
  it('renders an input with placeholder', () => {
    render(<DatePicker placeholder="Pick a date" />);
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
  });

  it('clicking the input opens the calendar dialog', async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick" />);
    await user.click(screen.getByPlaceholderText('Pick'));
    expect(screen.getByRole('dialog', { name: /choose date/i })).toBeInTheDocument();
  });

  it('clicking the calendar icon toggles the dialog', async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick" />);
    await user.click(screen.getByLabelText('Open calendar'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Close calendar'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('selecting a day fires onChange and closes the dialog', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker defaultValue={may2026} onChange={onChange} placeholder="Pick" />);
    await user.click(screen.getByPlaceholderText('Pick'));
    await user.click(screen.getByRole('gridcell', { name: /May 14th, 2026/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getDate()).toBe(14);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('Escape closes the dialog', async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick" />);
    await user.click(screen.getByPlaceholderText('Pick'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('ArrowDown on input opens the dialog', async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick" />);
    const input = screen.getByPlaceholderText('Pick');
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('formats the displayed value with the format prop', () => {
    render(<DatePicker defaultValue={may2026} format="yyyy-MM-dd" />);
    const input = screen.getByDisplayValue('2026-05-09');
    expect(input).toBeInTheDocument();
  });

  it('disabled state prevents opening', async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick" disabled />);
    await user.click(screen.getByPlaceholderText('Pick'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('DatePicker — a11y', () => {
  it('has no a11y violations (closed + open dialog)', async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePicker placeholder="Pick a date" aria-label="Date" />);
    expect(await runAxe(container)).toHaveNoViolations();
    await user.click(screen.getByPlaceholderText('Pick a date'));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});

describe('DatePicker — bounds', () => {
  it('disables days outside [minDate, maxDate]', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={may2026}
        minDate={new Date(2026, 4, 5)}
        maxDate={new Date(2026, 4, 20)}
        placeholder="Pick"
      />,
    );
    await user.click(screen.getByPlaceholderText('Pick'));
    expect(screen.getByRole('gridcell', { name: /May 1st, 2026/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('gridcell', { name: /May 25th, 2026/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('gridcell', { name: /May 10th, 2026/ })).not.toHaveAttribute(
      'aria-disabled',
    );
  });
});

describe('DatePicker — text input', () => {
  function Controlled() {
    const [v, setV] = useState<Date | null>(null);
    // Format as local YYYY-MM-DD; toISOString would shift across timezones.
    const display =
      v === null
        ? 'null'
        : `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
    return (
      <>
        <div data-testid="value">{display}</div>
        <DatePicker
          value={v}
          onChange={setV}
          allowTextInput
          format="yyyy-MM-dd"
          placeholder="YYYY-MM-DD"
        />
      </>
    );
  }

  it('typing a valid date and pressing Enter commits the value', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByPlaceholderText('YYYY-MM-DD');
    await user.click(input);
    await user.keyboard('{Escape}'); // close popover that opened on click? click only opens when not allowTextInput → no popover
    await user.type(input, '2026-05-09');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('value')).toHaveTextContent('2026-05-09');
  });

  it('typing an invalid date rolls back on blur', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByPlaceholderText('YYYY-MM-DD');
    await user.click(input);
    await user.type(input, 'garbage');
    input.blur();
    await waitFor(() => expect((input as HTMLInputElement).value).toBe(''));
  });

  it('typing a date outside bounds rolls back', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        allowTextInput
        format="yyyy-MM-dd"
        minDate={new Date(2026, 4, 5)}
        maxDate={new Date(2026, 4, 20)}
        placeholder="YYYY-MM-DD"
      />,
    );
    const input = screen.getByPlaceholderText('YYYY-MM-DD') as HTMLInputElement;
    await user.click(input);
    await user.type(input, '2026-05-01');
    input.blur();
    await waitFor(() => expect(input.value).toBe(''));
  });
});
