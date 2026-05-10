import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Separator } from './Separator';

describe('Separator', () => {
  it('decorative by default: role=none + aria-hidden', () => {
    render(<Separator data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('role', 'none');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('non-decorative: role=separator + aria-orientation', () => {
    render(<Separator decorative={false} orientation="vertical" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('role', 'separator');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('horizontal orientation applies h-px w-full', () => {
    render(<Separator orientation="horizontal" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('h-px');
    expect(el).toHaveClass('w-full');
  });

  it('vertical orientation applies w-px h-full', () => {
    render(<Separator orientation="vertical" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('w-px');
    expect(el).toHaveClass('h-full');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    render(<Separator className="my-4" data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveClass('my-4');
  });

  it('has no a11y violations (decorative + semantic)', async () => {
    const { container } = render(
      <div>
        <Separator />
        <Separator decorative={false} orientation="vertical" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
