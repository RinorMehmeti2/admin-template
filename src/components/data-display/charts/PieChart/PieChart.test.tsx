import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PieChart } from './PieChart';

const DATA = [
  { name: 'Direct', value: 400, color: 'primary' as const },
  { name: 'Search', value: 300, color: 'success' as const },
  { name: 'Social', value: 200, color: 'warning' as const },
];

describe('PieChart', () => {
  it('renders with role=img and pie aria-label', () => {
    render(
      <PieChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Visits' }]}
        width={400}
        height={300}
      />,
    );
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Pie chart'));
    expect(chart).toHaveAttribute('data-chart-type', 'pie');
  });

  it('renders one slice per row, each with the row colour', () => {
    const { container } = render(
      <PieChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Visits' }]}
        width={400}
        height={300}
      />,
    );
    const fills = Array.from(container.querySelectorAll('path[fill]')).map((p) =>
      p.getAttribute('fill'),
    );
    expect(fills).toEqual(expect.arrayContaining(['#2563eb', '#16a34a', '#d97706']));
  });

  it('legend toggles slice visibility', async () => {
    render(
      <PieChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Visits' }]}
        width={400}
        height={300}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Search' });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});
