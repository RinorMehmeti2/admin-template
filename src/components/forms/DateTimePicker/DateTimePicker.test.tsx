import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { DateTimePicker } from './DateTimePicker';

describe('DateTimePicker', () => {
  it('renders a DatePicker and a TimePicker side by side', () => {
    render(<DateTimePicker datePlaceholder="Date" timePlaceholder="Time" />);
    expect(screen.getByPlaceholderText('Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Time')).toBeInTheDocument();
  });

  it('selecting a date keeps existing time', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={new Date(2026, 4, 1, 14, 30, 0)}
        onChange={onChange}
        datePlaceholder="Date"
        timePlaceholder="Time"
      />,
    );
    await user.click(screen.getByPlaceholderText('Date'));
    await user.click(screen.getByRole('gridcell', { name: /May 9th, 2026/ }));
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(4);
    expect(arg.getDate()).toBe(9);
    expect(arg.getHours()).toBe(14);
    expect(arg.getMinutes()).toBe(30);
  });

  it('selecting a time keeps existing date', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={new Date(2026, 4, 1, 8, 0, 0)}
        onChange={onChange}
        datePlaceholder="Date"
        timePlaceholder="Time"
      />,
    );
    await user.click(screen.getByPlaceholderText('Time'));
    const hours = within(screen.getByRole('listbox', { name: 'Hours' })).getAllByRole('option');
    await user.click(hours[16]!);
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(4);
    expect(arg.getDate()).toBe(1);
    expect(arg.getHours()).toBe(16);
  });

  it('controlled value reflects external state', async () => {
    function Demo() {
      const [v, setV] = useState<Date | null>(new Date(2026, 4, 1, 9, 0, 0));
      return (
        <>
          <div data-testid="ts">{v?.toISOString().slice(0, 16) ?? 'null'}</div>
          <DateTimePicker value={v} onChange={setV} />
        </>
      );
    }
    render(<Demo />);
    expect(screen.getByTestId('ts')).toHaveTextContent('2026-05-01');
  });

  it('disables both sub-pickers', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker disabled datePlaceholder="Date" timePlaceholder="Time" />);
    await user.click(screen.getByPlaceholderText('Date'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <DateTimePicker datePlaceholder="Date" timePlaceholder="Time" />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
