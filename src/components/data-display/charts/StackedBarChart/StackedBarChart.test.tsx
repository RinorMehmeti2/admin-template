import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { StackedBarChart } from './StackedBarChart';

const DATA = [
  { month: 'Jan', a: 30, b: 20, c: 50 },
  { month: 'Feb', a: 25, b: 30, c: 45 },
];

describe('StackedBarChart', () => {
  it('renders with stacked aria-label and chart type', () => {
    render(
      <StackedBarChart
        xKey="month"
        data={DATA}
        series={[
          { key: 'a', label: 'A', color: 'primary' },
          { key: 'b', label: 'B', color: 'success' },
          { key: 'c', label: 'C', color: 'warning' },
        ]}
        width={400}
        height={200}
      />,
    );
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Stacked bar chart'));
    expect(chart).toHaveAttribute('data-chart-type', 'stacked-bar');
  });

  it('renders one legend pill per series', () => {
    render(
      <StackedBarChart
        xKey="month"
        data={DATA}
        series={[
          { key: 'a', label: 'Apples', color: 'primary' },
          { key: 'b', label: 'Bananas', color: 'success' },
        ]}
        width={400}
        height={200}
      />,
    );
    expect(screen.getByRole('button', { name: 'Apples' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bananas' })).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <StackedBarChart
        xKey="month"
        data={DATA}
        series={[
          { key: 'a', label: 'A', color: 'primary' },
          { key: 'b', label: 'B', color: 'success' },
        ]}
        width={400}
        height={200}
      />,
    );
    expect(
      await runAxe(container, { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
