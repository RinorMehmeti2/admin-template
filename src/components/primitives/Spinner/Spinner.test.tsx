import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with role=status and default label', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label', 'Loading');
  });

  it('accepts a custom label', () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Fetching data');
  });

  it.each(['xs', 'sm', 'md', 'lg'] as const)('renders size=%s', (size) => {
    render(<Spinner size={size} data-testid="spin" />);
    const el = screen.getByTestId('spin');
    expect(el.className).toContain('animate-spin');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className', () => {
    render(<Spinner className="text-primary" data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveClass('text-primary');
  });
});
