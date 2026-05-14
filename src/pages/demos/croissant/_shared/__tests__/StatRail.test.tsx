import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { StatRail } from '../StatRail';

const items = [
  {
    id: 'a',
    label: 'Revenue',
    value: 1200,
    delta: 4.2,
    spark: [1, 2, 3, 4, 5],
    tone: 'primary' as const,
  },
  {
    id: 'b',
    label: 'Orders',
    value: 42,
    delta: -1.1,
    spark: [5, 4, 3, 2, 1],
    tone: 'success' as const,
    accent: true,
  },
];

describe('StatRail', () => {
  it('renders each item', () => {
    render(<StatRail items={items} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(<StatRail items={items} />);
    await expect(runAxe(container)).resolves.toHaveNoViolations();
  });
});
