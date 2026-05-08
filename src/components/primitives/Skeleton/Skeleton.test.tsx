import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders an aria-hidden pulsing block', () => {
    render(<Skeleton data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('bg-surface-muted');
  });

  it('merges className for sizing', () => {
    render(<Skeleton className="h-4 w-32" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('h-4');
    expect(el).toHaveClass('w-32');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
