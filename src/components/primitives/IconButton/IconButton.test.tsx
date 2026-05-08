import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { IconButton } from './IconButton';

const Glyph = () => <svg aria-hidden="true" data-testid="glyph" />;

describe('IconButton', () => {
  it('exposes aria-label on the button', () => {
    render(
      <IconButton aria-label="Delete item">
        <Glyph />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument();
  });

  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'bg-surface-muted'],
    ['danger', 'bg-danger'],
    ['outline', 'border-border'],
  ] as const)('variant=%s', (variant, signal) => {
    render(
      <IconButton aria-label="x" variant={variant}>
        <Glyph />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass(signal);
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('size=%s is square', (size, signal) => {
    render(
      <IconButton aria-label="x" size={size}>
        <Glyph />
      </IconButton>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass(signal);
    // square: h and w should match
    expect(btn.className).toMatch(new RegExp(`w-${signal.split('-')[1]!}`));
  });

  it('isLoading shows spinner, hides children, sets aria-busy', () => {
    render(
      <IconButton aria-label="save" isLoading>
        <Glyph />
      </IconButton>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('glyph')).toBeNull();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton aria-label="x" ref={ref}>
        <Glyph />
      </IconButton>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges className', () => {
    render(
      <IconButton aria-label="x" className="extra">
        <Glyph />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('extra');
  });
});
