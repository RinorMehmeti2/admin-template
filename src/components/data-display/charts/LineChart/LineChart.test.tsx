import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineChart } from './LineChart';

const DATA = [
  { month: 'Jan', revenue: 100, expenses: 50 },
  { month: 'Feb', revenue: 200, expenses: 80 },
  { month: 'Mar', revenue: 150, expenses: 60 },
];

describe('LineChart', () => {
  it('renders with role=img and a generated aria-label', () => {
    render(
      <LineChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'primary' }]}
        width={400}
        height={200}
      />,
    );
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Line chart of Revenue'));
    expect(chart).toHaveAttribute('data-chart-type', 'line');
  });

  it('uses an explicit aria-label override', () => {
    render(
      <LineChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue' }]}
        width={400}
        height={200}
        ariaLabel="Custom label"
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Custom label');
  });

  it('resolves series colors from the token palette (primary → fallback hex)', () => {
    const { container } = render(
      <LineChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'primary' }]}
        width={400}
        height={200}
      />,
    );
    // Recharts renders Line as a <path stroke=...>. Find any path with the
    // primary fallback colour the hook returns when CSS vars are absent (jsdom).
    const paths = container.querySelectorAll('path[stroke]');
    const strokes = Array.from(paths).map((p) => p.getAttribute('stroke'));
    expect(strokes).toContain('#2563eb');
  });

  it('legend toggles series visibility', async () => {
    render(
      <LineChart
        xKey="month"
        data={DATA}
        series={[
          { key: 'revenue', label: 'Revenue', color: 'primary' },
          { key: 'expenses', label: 'Expenses', color: 'danger' },
        ]}
        width={400}
        height={200}
      />,
    );
    const revenueBtn = screen.getByRole('button', { name: 'Revenue' });
    expect(revenueBtn).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(revenueBtn);
    expect(revenueBtn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(revenueBtn);
    expect(revenueBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides legend when showLegend=false', () => {
    render(
      <LineChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue' }]}
        width={400}
        height={200}
        showLegend={false}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Revenue' })).toBeNull();
  });
});
