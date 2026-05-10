import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders an unchecked checkbox by default', () => {
    render(<Checkbox aria-label="agree" />);
    const cb = screen.getByRole('checkbox', { name: 'agree' });
    expect(cb).not.toBeChecked();
  });

  it('controlled checked state', () => {
    render(<Checkbox aria-label="x" checked readOnly />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('user click toggles', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="x" onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('keyboard space toggles when focused', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="x" onChange={onChange} />);
    const cb = screen.getByRole('checkbox') as HTMLInputElement;
    cb.focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalled();
  });

  it('disabled blocks interaction', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="x" disabled onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('indeterminate sets the DOM property', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox aria-label="x" ref={ref} indeterminate />);
    expect(ref.current?.indeterminate).toBe(true);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox aria-label="x" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('merges className on wrapper', () => {
    render(<Checkbox aria-label="x" className="custom" />);
    const cb = screen.getByRole('checkbox');
    expect(cb.parentElement).toHaveClass('custom');
  });

  it('has no a11y violations (unchecked + checked + indeterminate + disabled)', async () => {
    const { container } = render(
      <div>
        <Checkbox aria-label="agree" />
        <Checkbox aria-label="signed" checked readOnly />
        <Checkbox aria-label="some" indeterminate />
        <Checkbox aria-label="off" disabled />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
