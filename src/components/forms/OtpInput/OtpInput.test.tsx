import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { OtpInput } from './OtpInput';

function getInput(): HTMLInputElement {
  // Single textbox in the component.
  const el = document.querySelector('input[autocomplete="one-time-code"]');
  if (el === null) throw new Error('OTP input not found');
  return el as HTMLInputElement;
}

describe('OtpInput', () => {
  it('renders N boxes for given length', () => {
    const { container } = render(<OtpInput length={4} aria-label="Code" autoFocusOnMount={false} />);
    expect(container.querySelectorAll('[data-filled]').length).toBe(4);
  });

  it('types sequentially, fires onValueChange + onComplete', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    render(
      <OtpInput
        length={4}
        aria-label="Code"
        onValueChange={onValueChange}
        onComplete={onComplete}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.keyboard('1234');
    expect(input).toHaveValue('1234');
    expect(onValueChange).toHaveBeenLastCalledWith('1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenLastCalledWith('1234');
  });

  it('paste fills boxes, ignores disallowed chars', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <OtpInput
        length={6}
        aria-label="Code"
        onValueChange={onValueChange}
        autoFocusOnMount={false}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.paste('12-34-56');
    expect(input).toHaveValue('123456');
    expect(onValueChange).toHaveBeenLastCalledWith('123456');
  });

  it('partial paste fills only available boxes', async () => {
    const user = userEvent.setup();
    render(<OtpInput length={6} aria-label="Code" autoFocusOnMount={false} />);
    const input = getInput();
    await user.click(input);
    await user.paste('123');
    expect(input).toHaveValue('123');
  });

  it('filters disallowed chars while typing (digits only by default)', async () => {
    const user = userEvent.setup();
    render(<OtpInput length={6} aria-label="Code" autoFocusOnMount={false} />);
    const input = getInput();
    await user.click(input);
    await user.keyboard('1a2b3c');
    expect(input).toHaveValue('123');
  });

  it('alphanumeric mode accepts letters', async () => {
    const user = userEvent.setup();
    render(
      <OtpInput
        length={6}
        aria-label="Code"
        allowedChars={/^[0-9a-zA-Z]$/}
        autoFocusOnMount={false}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.keyboard('A1B2C3');
    expect(input).toHaveValue('A1B2C3');
  });

  it('Backspace deletes the previous char', async () => {
    const user = userEvent.setup();
    render(<OtpInput length={6} aria-label="Code" autoFocusOnMount={false} />);
    const input = getInput();
    await user.click(input);
    await user.keyboard('123');
    await user.keyboard('{Backspace}');
    expect(input).toHaveValue('12');
    await user.keyboard('{Backspace}{Backspace}');
    expect(input).toHaveValue('');
  });

  it('truncates over-length paste to length', async () => {
    const user = userEvent.setup();
    render(<OtpInput length={4} aria-label="Code" autoFocusOnMount={false} />);
    const input = getInput();
    await user.click(input);
    await user.paste('123456789');
    expect(input).toHaveValue('1234');
  });

  it('masked renders dots instead of chars', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <OtpInput length={4} masked aria-label="Code" autoFocusOnMount={false} />,
    );
    const input = getInput();
    await user.click(input);
    await user.keyboard('1234');
    const filled = container.querySelectorAll('[data-filled="true"]');
    expect(filled.length).toBe(4);
    filled.forEach((el) => expect(el.textContent).toBe('•'));
  });

  it('disabled blocks input', () => {
    render(<OtpInput length={4} disabled defaultValue="12" aria-label="Code" />);
    expect(getInput()).toBeDisabled();
  });

  it('error variant applies danger border to boxes', () => {
    const { container } = render(
      <OtpInput length={4} error defaultValue="12" aria-label="Code" autoFocusOnMount={false} />,
    );
    const boxes = container.querySelectorAll('[data-filled]');
    expect(boxes.length).toBe(4);
    expect((boxes[0] as HTMLElement).className).toContain('border-danger');
  });

  it('input has autocomplete=one-time-code and inputmode=numeric by default', () => {
    render(<OtpInput length={6} aria-label="Code" autoFocusOnMount={false} />);
    const input = getInput();
    expect(input.getAttribute('autocomplete')).toBe('one-time-code');
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });

  it('alphanumeric mode uses inputmode=text', () => {
    render(
      <OtpInput
        length={6}
        aria-label="Code"
        allowedChars={/^[0-9a-zA-Z]$/}
        autoFocusOnMount={false}
      />,
    );
    expect(getInput().getAttribute('inputmode')).toBe('text');
  });

  it('controlled value prop drives boxes', () => {
    const { container, rerender } = render(
      <OtpInput length={4} value="12" aria-label="Code" autoFocusOnMount={false} />,
    );
    expect(getInput()).toHaveValue('12');
    const filledBefore = container.querySelectorAll('[data-filled="true"]');
    expect(filledBefore.length).toBe(2);
    rerender(<OtpInput length={4} value="1234" aria-label="Code" autoFocusOnMount={false} />);
    const filledAfter = container.querySelectorAll('[data-filled="true"]');
    expect(filledAfter.length).toBe(4);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="otp1">Verification code</label>
        <OtpInput id="otp1" length={6} autoFocusOnMount={false} />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
