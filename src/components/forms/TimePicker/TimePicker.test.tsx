import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from './TimePicker';

describe('TimePicker — rendering', () => {
  it('renders an input with the placeholder', () => {
    render(<TimePicker placeholder="Pick time" />);
    expect(screen.getByPlaceholderText('Pick time')).toBeInTheDocument();
  });

  it('clicking the input opens the dialog', async () => {
    const user = userEvent.setup();
    render(<TimePicker placeholder="Pick" />);
    await user.click(screen.getByPlaceholderText('Pick'));
    expect(screen.getByRole('dialog', { name: /choose time/i })).toBeInTheDocument();
  });

  it('clicking the clock icon toggles the dialog', async () => {
    const user = userEvent.setup();
    render(<TimePicker placeholder="Pick" />);
    await user.click(screen.getByLabelText('Open time picker'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Close time picker'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('disabled prevents opening', async () => {
    const user = userEvent.setup();
    render(<TimePicker placeholder="Pick" disabled />);
    await user.click(screen.getByPlaceholderText('Pick'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape closes', async () => {
    const user = userEvent.setup();
    render(<TimePicker placeholder="Pick" />);
    await user.click(screen.getByPlaceholderText('Pick'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('TimePicker — formats', () => {
  it('24h format renders hour column 00-23 and no period', async () => {
    const user = userEvent.setup();
    render(<TimePicker format="24h" defaultValue="10:30" />);
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    expect(hours).toHaveLength(24);
    expect(hours[0]).toHaveTextContent('00');
    expect(hours[23]).toHaveTextContent('23');
    expect(screen.queryByRole('listbox', { name: 'Period' })).toBeNull();
  });

  it('12h format renders 12-1..11 hours and an AM/PM column', async () => {
    const user = userEvent.setup();
    render(<TimePicker format="12h" defaultValue="10:30" />);
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    expect(hours).toHaveLength(12);
    expect(hours[0]).toHaveTextContent('12');
    expect(hours[1]).toHaveTextContent('1');
    const period = within(screen.getByRole('listbox', { name: 'Period' })).getAllByRole('option');
    expect(period.map((b) => b.textContent)).toEqual(['AM', 'PM']);
  });

  it('withSeconds shows the seconds column', async () => {
    const user = userEvent.setup();
    render(<TimePicker withSeconds defaultValue="10:30:45" />);
    await user.click(screen.getByRole('textbox'));
    expect(screen.getByRole('listbox', { name: 'Seconds' })).toBeInTheDocument();
  });

  it('format=24h displays time as HH:MM', () => {
    render(<TimePicker format="24h" defaultValue="08:05" />);
    expect(screen.getByDisplayValue('08:05')).toBeInTheDocument();
  });

  it('format=12h displays time as h:mm AM/PM', () => {
    render(<TimePicker format="12h" defaultValue="13:05" />);
    expect(screen.getByDisplayValue('1:05 PM')).toBeInTheDocument();
  });

  it('format=12h handles midnight as 12 AM', () => {
    render(<TimePicker format="12h" defaultValue="00:00" />);
    expect(screen.getByDisplayValue('12:00 AM')).toBeInTheDocument();
  });

  it('format=12h with seconds renders "h:mm:ss AM/PM"', () => {
    render(<TimePicker format="12h" withSeconds defaultValue="13:05:09" />);
    expect(screen.getByDisplayValue('1:05:09 PM')).toBeInTheDocument();
  });
});

describe('TimePicker — step', () => {
  it('step=15 yields 4 minute options', async () => {
    const user = userEvent.setup();
    render(<TimePicker step={15} defaultValue="10:00" />);
    await user.click(screen.getByRole('textbox'));
    const mins = within(screen.getByRole('listbox', { name: 'Minutes' })).getAllByRole('option');
    expect(mins.map((b) => b.textContent)).toEqual(['00', '15', '30', '45']);
  });

  it('snaps an off-step minute down on parse', () => {
    render(<TimePicker step={15} defaultValue="10:23" />);
    expect(screen.getByDisplayValue('10:15')).toBeInTheDocument();
  });
});

describe('TimePicker — selection & emit type', () => {
  it('clicking a minute fires onChange with a string when input was a string', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker defaultValue="10:00" onChange={onChange} />);
    await user.click(screen.getByRole('textbox'));
    const mins = within(screen.getByRole('listbox', { name: 'Minutes' })).getAllByRole('option');
    await user.click(mins[15]!); // index 15 with step=1 → minute 15
    expect(onChange).toHaveBeenLastCalledWith('10:15');
  });

  it('emits a Date when input was a Date', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const initial = new Date(2026, 4, 9, 10, 0, 0);
    render(<TimePicker defaultValue={initial} onChange={onChange} />);
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    await user.click(hours[14]!); // 14:00
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0]![0];
    expect(arg).toBeInstanceOf(Date);
    expect((arg as Date).getHours()).toBe(14);
  });

  it('emits HH:MM:SS when withSeconds is true and input was a string', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker withSeconds defaultValue="10:00:00" onChange={onChange} />);
    await user.click(screen.getByRole('textbox'));
    const secs = within(screen.getByRole('listbox', { name: 'Seconds' })).getAllByRole('option');
    await user.click(secs[30]!);
    expect(onChange).toHaveBeenLastCalledWith('10:00:30');
  });

  it('12h period toggle shifts the underlying 24h hour', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker format="12h" defaultValue="10:00" onChange={onChange} />);
    await user.click(screen.getByRole('textbox'));
    const period = within(screen.getByRole('listbox', { name: 'Period' })).getAllByRole('option');
    await user.click(period[1]!); // PM
    expect(onChange).toHaveBeenLastCalledWith('22:00');
  });
});

describe('TimePicker — bounds', () => {
  it('disables hours before minTime', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue="12:00" minTime="10:00" />);
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    expect(hours[8]).toBeDisabled();
    expect(hours[9]).toBeDisabled();
    expect(hours[10]).not.toBeDisabled();
  });

  it('disables hours after maxTime', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue="12:00" maxTime="14:00" />);
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    expect(hours[14]).not.toBeDisabled();
    expect(hours[15]).toBeDisabled();
  });

  it('disables minutes before minTime when on the same hour', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue="10:30" minTime="10:30" />);
    await user.click(screen.getByRole('textbox'));
    const mins = within(screen.getByRole('listbox', { name: 'Minutes' })).getAllByRole('option');
    expect(mins[29]).toBeDisabled();
    expect(mins[30]).not.toBeDisabled();
  });
});

describe('TimePicker — keyboard', () => {
  it('ArrowDown on input opens the dialog', async () => {
    const user = userEvent.setup();
    render(<TimePicker placeholder="Pick" />);
    const input = screen.getByPlaceholderText('Pick');
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Enter on a column option commits and closes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker defaultValue="10:00" onChange={onChange} />);
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    await waitFor(() => expect(document.activeElement).toBe(hours[10]));
    // Focus is on the active hour (10). Move to 11 then press Enter.
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('ArrowDown navigates within a column', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue="10:00" />);
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    // Auto-focus runs in a rAF — wait for it before pressing keys.
    await waitFor(() => expect(document.activeElement).toBe(hours[10]));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(hours[11]);
  });
});

describe('TimePicker — controlled', () => {
  function Controlled({ onChange }: { onChange?: (v: Date | string | null) => void }) {
    const [v, setV] = useState<string | null>('10:00');
    return (
      <>
        <div data-testid="value">{v ?? 'null'}</div>
        <TimePicker
          value={v}
          onChange={(next) => {
            const s = typeof next === 'string' ? next : null;
            setV(s);
            onChange?.(next);
          }}
        />
      </>
    );
  }

  it('controlled value reflects external state', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    expect(screen.getByTestId('value')).toHaveTextContent('10:00');
    await user.click(screen.getByRole('textbox'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    await user.click(hours[14]!);
    expect(screen.getByTestId('value')).toHaveTextContent('14:00');
  });
});
