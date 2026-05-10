import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { RadialChart } from './RadialChart';

const DATA = [
  { name: 'CPU', value: 65, color: 'primary' as const },
  { name: 'GPU', value: 40, color: 'success' as const },
  { name: 'RAM', value: 80, color: 'warning' as const },
];

describe('RadialChart', () => {
  it('renders with role=img and radial aria-label', () => {
    render(
      <RadialChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Usage' }]}
        width={400}
        height={300}
      />,
    );
    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Radial bar chart'));
    expect(chart).toHaveAttribute('data-chart-type', 'radial');
  });

  it('renders a legend pill per row', () => {
    render(
      <RadialChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Usage' }]}
        width={400}
        height={300}
      />,
    );
    expect(screen.getByRole('button', { name: 'CPU' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GPU' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RAM' })).toBeInTheDocument();
  });

  it('legend toggles row visibility', async () => {
    render(
      <RadialChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Usage' }]}
        width={400}
        height={300}
      />,
    );
    const btn = screen.getByRole('button', { name: 'CPU' });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <RadialChart
        xKey="name"
        data={DATA}
        series={[{ key: 'value', label: 'Usage' }]}
        width={400}
        height={300}
      />,
    );
    expect(
      await runAxe(container, { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
