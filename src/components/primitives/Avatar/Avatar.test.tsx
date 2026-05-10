import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders <img> when src is provided', () => {
    render(<Avatar src="https://example.com/a.png" name="Alice" />);
    const img = screen.getByRole('img', { name: /Alice/i }).querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/a.png');
  });

  it('falls back to initials when no src', () => {
    render(<Avatar name="Alice Cooper" />);
    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  it('falls back to initials on image load error', () => {
    render(<Avatar src="bad" name="Bob Marley" />);
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    fireEvent.error(img!);
    expect(screen.getByText('BM')).toBeInTheDocument();
  });

  it('handles single-name initials (first 2 letters)', () => {
    render(<Avatar name="Cher" />);
    expect(screen.getByText('CH')).toBeInTheDocument();
  });

  it.each([
    ['xs', 'h-6'],
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
    ['xl', 'h-16'],
  ] as const)('size=%s', (size, signal) => {
    render(<Avatar name="X" size={size} />);
    expect(screen.getByRole('img')).toHaveClass(signal);
  });

  it('produces deterministic fallback color for the same name', () => {
    const { unmount } = render(<Avatar name="Alice Cooper" data-testid="a1" />);
    const a1 = screen.getByTestId('a1').className;
    unmount();
    render(<Avatar name="Alice Cooper" data-testid="a2" />);
    const a2 = screen.getByTestId('a2').className;
    expect(a1).toBe(a2);
  });

  it('encodes status into aria-label', () => {
    render(<Avatar name="Alice" status="online" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Alice, online');
  });

  it.each(['online', 'offline', 'busy', 'away'] as const)(
    'renders status=%s indicator',
    (status) => {
      const { container } = render(<Avatar name="x" status={status} />);
      // 2 children for fallback layout: text span + status dot span
      const spans = container.querySelectorAll('span > span');
      expect(spans.length).toBe(2);
    },
  );

  it('uses alt over name for the label when provided', () => {
    render(<Avatar src="x" name="Alice" alt="Avatar of Alice" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Avatar of Alice');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="x" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className', () => {
    render(<Avatar name="x" className="extra" />);
    expect(screen.getByRole('img')).toHaveClass('extra');
  });

  it('has no a11y violations (initials + image + status)', async () => {
    const { container } = render(
      <div>
        <Avatar name="Alice Cooper" />
        <Avatar src="https://example.com/a.png" name="Alice" />
        <Avatar name="Bob" status="online" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
