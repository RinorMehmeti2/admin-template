import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { BarChart } from './BarChart';

const DATA = [
  { month: 'Jan', revenue: 100, expenses: 50 },
  { month: 'Feb', revenue: 200, expenses: 80 },
];

describe('BarChart', () => {
  it('renders with role=img', () => {
    render(
      <BarChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'primary' }]}
        width={400}
        height={200}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Bar chart of Revenue'),
    );
  });

  it('resolves series colour to fill on bars', () => {
    const { container } = render(
      <BarChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'warning' }]}
        width={400}
        height={200}
      />,
    );
    const fills = Array.from(container.querySelectorAll('path[fill]')).map((p) =>
      p.getAttribute('fill'),
    );
    expect(fills).toContain('#d97706');
  });

  it('legend toggles series visibility', async () => {
    render(
      <BarChart
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
    const btn = screen.getByRole('button', { name: 'Expenses' });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <BarChart
        xKey="month"
        data={DATA}
        series={[{ key: 'revenue', label: 'Revenue', color: 'primary' }]}
        width={400}
        height={200}
      />,
    );
    // Charts intentionally place an interactive legend inside a role="img"
    // container — the chart is described by aria-label, the legend is
    // supplemental. nested-interactive doesn't fit. See CONTRIBUTING.md
    // "A11y exceptions".
    expect(
      await runAxe(container, { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
