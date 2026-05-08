import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders with role=progressbar', () => {
    render(<Progress value={50} label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).toBeInTheDocument();
  });

  it('sets aria-valuenow / valuemin / valuemax', () => {
    render(<Progress value={30} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '30');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value to [0, max]', () => {
    render(<Progress value={150} max={100} data-testid="p" />);
    expect(screen.getByTestId('p')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps negative values to 0', () => {
    render(<Progress value={-5} max={100} data-testid="p" />);
    expect(screen.getByTestId('p')).toHaveAttribute('aria-valuenow', '0');
  });

  it('indeterminate omits aria-valuenow', () => {
    render(<Progress indeterminate label="x" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it.each([
    ['default', 'bg-primary'],
    ['success', 'bg-success'],
    ['warning', 'bg-warning'],
    ['danger', 'bg-danger'],
  ] as const)('variant=%s', (variant, signal) => {
    render(<Progress value={50} variant={variant} data-testid="p" />);
    const bar = screen.getByTestId('p').firstElementChild;
    expect(bar?.className).toContain(signal);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={0} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    render(<Progress value={50} className="custom" data-testid="p" />);
    expect(screen.getByTestId('p')).toHaveClass('custom');
  });
});
