import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposedChart } from './ComposedChart';

const DATA = [
  { quarter: 'Q1', revenue: 100, growth: 10, target: 80 },
  { quarter: 'Q2', revenue: 200, growth: 25, target: 130 },
  { quarter: 'Q3', revenue: 180, growth: 18, target: 150 },
];

describe('ComposedChart', () => {
  it('renders with composed aria-label', () => {
    render(
      <ComposedChart
        xKey="quarter"
        data={DATA}
        series={[
          { key: 'revenue', label: 'Revenue', color: 'primary', type: 'bar' },
          { key: 'growth', label: 'Growth', color: 'success', type: 'line' },
          { key: 'target', label: 'Target', color: 'warning', type: 'area' },
        ]}
        width={500}
        height={250}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Composed chart'),
    );
  });

  it('renders bars + lines + areas mixed in one chart', () => {
    const { container } = render(
      <ComposedChart
        xKey="quarter"
        data={DATA}
        series={[
          { key: 'revenue', label: 'Revenue', color: 'primary', type: 'bar' },
          { key: 'growth', label: 'Growth', color: 'success', type: 'line' },
        ]}
        width={500}
        height={250}
      />,
    );
    const fills = Array.from(container.querySelectorAll('path[fill]')).map((p) =>
      p.getAttribute('fill'),
    );
    expect(fills).toContain('#2563eb');
  });

  it('legend toggles each series independently', async () => {
    render(
      <ComposedChart
        xKey="quarter"
        data={DATA}
        series={[
          { key: 'revenue', label: 'Revenue', color: 'primary', type: 'bar' },
          { key: 'growth', label: 'Growth', color: 'success', type: 'line' },
        ]}
        width={500}
        height={250}
      />,
    );
    const growthBtn = screen.getByRole('button', { name: 'Growth' });
    await userEvent.click(growthBtn);
    expect(growthBtn).toHaveAttribute('aria-pressed', 'false');
    const revenueBtn = screen.getByRole('button', { name: 'Revenue' });
    expect(revenueBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
