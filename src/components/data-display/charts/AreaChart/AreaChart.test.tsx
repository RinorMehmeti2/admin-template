import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { AreaChart } from './AreaChart';

const DATA = [
  { month: 'Jan', revenue: 100 },
  { month: 'Feb', revenue: 200 },
  { month: 'Mar', revenue: 150 },
];

describe('AreaChart', () => {
  it('renders with role=img and area aria-label', () => {
    render(
      <AreaChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'success' }]}
        width={400}
        height={200}
      />,
    );
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Area chart'));
    expect(chart).toHaveAttribute('data-chart-type', 'area');
  });

  it('renders gradient fills using the resolved series colour', () => {
    const { container } = render(
      <AreaChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'success' }]}
        width={400}
        height={200}
      />,
    );
    const stops = container.querySelectorAll('stop[stop-color]');
    const colors = Array.from(stops).map((s) => s.getAttribute('stop-color'));
    expect(colors).toContain('#16a34a');
  });

  it('legend toggles series visibility', async () => {
    render(
      <AreaChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'success' }]}
        width={400}
        height={200}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Revenue' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <AreaChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'success' }]}
        width={400}
        height={200}
      />,
    );
    expect(
      await runAxe(container, { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
