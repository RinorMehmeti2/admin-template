import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DonutChart } from './DonutChart';

const DATA = [
  { name: 'Direct', value: 400 },
  { name: 'Search', value: 300 },
];

describe('DonutChart', () => {
  it('renders with donut chart-type marker', () => {
    render(
      <DonutChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Visits' }]}
        width={400}
        height={300}
      />,
    );
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Donut chart'));
    expect(chart).toHaveAttribute('data-chart-type', 'donut');
  });

  it('renders the centre label when provided', () => {
    render(
      <DonutChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Visits' }]}
        centerLabel={{ value: '700', sub: 'visits' }}
        width={400}
        height={300}
      />,
    );
    expect(screen.getByText('700')).toBeInTheDocument();
    expect(screen.getByText('visits')).toBeInTheDocument();
  });
});
