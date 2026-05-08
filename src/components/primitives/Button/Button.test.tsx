import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default variant + size', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('bg-primary');
    expect(btn).toHaveClass('h-10');
  });

  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'bg-surface-muted'],
    ['ghost', 'hover:bg-surface-muted'],
    ['outline', 'border-border'],
    ['danger', 'bg-danger'],
    ['link', 'underline-offset-4'],
  ] as const)('variant=%s applies signal class', (variant, signal) => {
    render(<Button variant={variant}>x</Button>);
    expect(screen.getByRole('button')).toHaveClass(signal);
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
    ['icon', 'w-10'],
  ] as const)('size=%s applies signal class', (size, signal) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole('button')).toHaveClass(signal);
  });

  it('renders leftIcon and rightIcon', () => {
    render(
      <Button
        leftIcon={<span data-testid="left">L</span>}
        rightIcon={<span data-testid="right">R</span>}
      >
        text
      </Button>,
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('isLoading replaces leftIcon with Spinner, hides rightIcon, sets aria-busy and disables', () => {
    render(
      <Button
        isLoading
        leftIcon={<span data-testid="left">L</span>}
        rightIcon={<span data-testid="right">R</span>}
      >
        save
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByTestId('left')).toBeNull();
    expect(screen.queryByTestId('right')).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('forwards ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges className', () => {
    render(<Button className="custom">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('fires onClick when not disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        x
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults type to button (avoids accidental form submit)', () => {
    render(<Button>x</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
