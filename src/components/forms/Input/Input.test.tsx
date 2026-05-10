import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default variant', () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-border');
  });

  it('error variant sets aria-invalid and danger border', () => {
    render(<Input variant="error" placeholder="x" />);
    const input = screen.getByPlaceholderText('x');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-danger');
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('inputSize=%s', (size, signal) => {
    render(<Input inputSize={size} placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass(signal);
  });

  it('disabled state', () => {
    render(<Input disabled placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toBeDisabled();
  });

  it('readonly state', () => {
    render(<Input readOnly value="x" onChange={() => undefined} />);
    expect(screen.getByDisplayValue('x')).toHaveAttribute('readonly');
  });

  it('renders leftIcon and rightIcon', () => {
    render(
      <Input
        placeholder="x"
        leftIcon={<span data-testid="L">L</span>}
        rightIcon={<span data-testid="R">R</span>}
      />,
    );
    expect(screen.getByTestId('L')).toBeInTheDocument();
    expect(screen.getByTestId('R')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('x')).toHaveClass('pl-9', 'pr-9');
  });

  it('renders prefix and suffix', () => {
    render(<Input placeholder="x" prefix="$" suffix="USD" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('merges className', () => {
    render(<Input className="custom" placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveClass('custom');
  });

  it('user can type', async () => {
    render(<Input placeholder="x" />);
    const input = screen.getByPlaceholderText('x');
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('has no a11y violations (default + error + with affixes)', async () => {
    const { container } = render(
      <div>
        <label htmlFor="i1">Email</label>
        <Input id="i1" placeholder="Email" />
        <label htmlFor="i2">Amount</label>
        <Input id="i2" variant="error" placeholder="Amount" prefix="$" suffix="USD" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
