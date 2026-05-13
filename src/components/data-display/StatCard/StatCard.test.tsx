import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { StatCard } from './StatCard';

beforeEach(() => {
  // Force reduced-motion so the counter snaps and we can assert final value.
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Revenue" value={48210} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('48,210')).toBeInTheDocument();
  });

  it('formats value via custom formatter', () => {
    render(<StatCard label="Price" value={1234} formatValue={(n) => `$${n}`} />);
    expect(screen.getByText('$1234')).toBeInTheDocument();
  });

  it('uses displayValue when provided (skips counter)', () => {
    render(<StatCard label="x" value={123} displayValue="Custom" />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('shows up trend for positive delta', () => {
    render(<StatCard label="x" value={100} delta={12.5} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('shows down trend for negative delta', () => {
    render(<StatCard label="x" value={100} delta={-4.2} />);
    expect(screen.getByText('-4.2%')).toBeInTheDocument();
  });

  it('renders delta label when provided', () => {
    render(<StatCard label="x" value={100} delta={1} deltaLabel="vs last week" />);
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('clickable: role=button + Enter triggers handler', async () => {
    const onClick = vi.fn();
    render(<StatCard label="x" value={1} onClick={onClick} />);
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders loading skeleton', () => {
    const { container } = render(<StatCard label="x" value={1} loading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders built-in sparkline from data', () => {
    const { container } = render(<StatCard label="x" value={1} sparklineData={[1, 2, 3, 4]} />);
    expect(container.querySelector('svg polyline')).toBeInTheDocument();
  });

  it('renders unit suffix', () => {
    render(<StatCard label="x" value={42} unit="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <StatCard label="Revenue" value={48210} delta={12.5} deltaLabel="vs last week" />
        <StatCard label="Users" value={100} delta={-3} onClick={() => {}} />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
