import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders text content', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it.each([
    ['neutral', 'bg-surface-muted'],
    ['primary', 'text-primary'],
    ['success', 'text-success'],
    ['warning', 'text-warning'],
    ['danger', 'text-danger'],
    ['info', 'text-info'],
  ] as const)('variant=%s', (variant, signal) => {
    render(<Badge variant={variant} data-testid="b">x</Badge>);
    expect(screen.getByTestId('b')).toHaveClass(signal);
  });

  it.each([
    ['sm', 'text-xs'],
    ['md', 'text-sm'],
  ] as const)('size=%s', (size, signal) => {
    render(<Badge size={size} data-testid="b">x</Badge>);
    expect(screen.getByTestId('b')).toHaveClass(signal);
  });

  it('renders dot indicator when dot=true', () => {
    const { container } = render(<Badge dot>x</Badge>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeNull();
  });

  it('does not render dot by default', () => {
    const { container } = render(<Badge>x</Badge>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className', () => {
    render(<Badge className="extra" data-testid="b">x</Badge>);
    expect(screen.getByTestId('b')).toHaveClass('extra');
  });
});
