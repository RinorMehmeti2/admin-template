import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { NumberInput } from './NumberInput';
import { formatForDisplay, parseNumber } from './numberInputUtils';

afterEach(() => {
  vi.useRealTimers();
});

describe('NumberInput', () => {
  describe('format/parse roundtrip', () => {
    it.each([
      ['en', 1234.5],
      ['en', -42.123],
      ['en', 0],
      ['en', 1_000_000],
      ['es', 1234.5],
      ['es', -42.123],
      ['es', 0],
      ['es', 1_000_000],
    ] as const)('locale=%s value=%s', (locale, n) => {
      const text = formatForDisplay(n, locale);
      const parsed = parseNumber(text, locale);
      expect(parsed).not.toBeNull();
      expect(parsed as number).toBeCloseTo(n);
    });
  });

  it('renders default value with formatting (en, precision=2)', () => {
    render(<NumberInput aria-label="amount" defaultValue={1234.5} locale="en" precision={2} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('1,234.50');
  });

  it('shows raw editable string on focus, formatted on blur', async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="amount" defaultValue={1234.5} locale="en" precision={2} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('1,234.50');
    await user.click(input);
    expect(input).toHaveValue('1234.50');
    await user.tab();
    expect(input).toHaveValue('1,234.50');
  });

  it('typing commits parsed value', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberInput aria-label="x" locale="en" onValueChange={onValueChange} />);
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.type(input, '12.5');
    expect(onValueChange).toHaveBeenLastCalledWith(12.5);
  });

  it('parses Spanish-locale input on blur', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberInput aria-label="x" locale="es" onValueChange={onValueChange} />);
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.type(input, '1.234,56');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(1234.56);
  });

  it('ArrowUp/ArrowDown step', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={4}
        step={2}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(6);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it('Shift+ArrowUp steps by step*10', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={0}
        step={1}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it('PageUp/PageDown step by 10x', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={0}
        step={1}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{PageUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    await user.keyboard('{PageDown}{PageDown}');
    expect(onValueChange).toHaveBeenLastCalledWith(-10);
  });

  it('Home/End jump to min/max', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={5}
        min={0}
        max={100}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it('clamps to min/max on blur', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <NumberInput aria-label="x" locale="en" min={0} max={10} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.type(input, '99');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(10);

    await user.click(input);
    await user.clear(input);
    await user.type(input, '-5');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('respects allowNegative=false', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        allowNegative={false}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.type(input, '-7');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(7);
  });

  it('stepper buttons increment and decrement', async () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={5}
        step={1}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.pointerDown(screen.getByLabelText('Increment'), { button: 0 });
    fireEvent.pointerUp(screen.getByLabelText('Increment'));
    expect(onValueChange).toHaveBeenLastCalledWith(6);

    fireEvent.pointerDown(screen.getByLabelText('Decrement'), { button: 0 });
    fireEvent.pointerUp(screen.getByLabelText('Decrement'));
    fireEvent.pointerDown(screen.getByLabelText('Decrement'), { button: 0 });
    fireEvent.pointerUp(screen.getByLabelText('Decrement'));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it('hold-to-repeat fires multiple steps', () => {
    vi.useFakeTimers();
    const onValueChange = vi.fn();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={0}
        step={1}
        onValueChange={onValueChange}
      />,
    );
    const incBtn = screen.getByLabelText('Increment');
    fireEvent.pointerDown(incBtn, { button: 0 });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.pointerUp(incBtn);
    expect(onValueChange.mock.calls.length).toBeGreaterThan(2);
  });

  it('disables stepper buttons at min/max', () => {
    render(<NumberInput aria-label="x" locale="en" defaultValue={10} min={0} max={10} />);
    expect(screen.getByLabelText('Increment')).toBeDisabled();
    expect(screen.getByLabelText('Decrement')).not.toBeDisabled();
  });

  it('wheel scroll changes value when allowWheel and focused', () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={0}
        step={1}
        allowWheel
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.wheel(input, { deltaY: -100 });
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    fireEvent.wheel(input, { deltaY: 100 });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('does not change value on wheel when allowWheel is off', () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput aria-label="x" locale="en" defaultValue={0} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.wheel(input, { deltaY: -100 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('exposes spinbutton ARIA attrs', () => {
    render(
      <NumberInput
        aria-label="x"
        locale="en"
        defaultValue={5}
        min={0}
        max={10}
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />,
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '10');
    expect(input).toHaveAttribute('aria-valuenow', '5');
    expect(input).toHaveAttribute('aria-valuetext', '$5.00');
  });

  it('disabled state', () => {
    render(<NumberInput aria-label="x" disabled defaultValue={5} />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getByLabelText('Increment')).toBeDisabled();
    expect(screen.getByLabelText('Decrement')).toBeDisabled();
  });

  it('formats currency on blur', async () => {
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="price"
        locale="en"
        formatOptions={{ style: 'currency', currency: 'USD' }}
        precision={2}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.type(input, '1299.5');
    await user.tab();
    expect(input).toHaveValue('$1,299.50');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="n1">Amount</label>
        <NumberInput id="n1" defaultValue={42} locale="en" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
