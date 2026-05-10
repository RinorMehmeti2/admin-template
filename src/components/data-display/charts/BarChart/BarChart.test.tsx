import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
