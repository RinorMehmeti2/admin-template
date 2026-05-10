import { ComposedChart } from './ComposedChart';

export default { title: 'Data display/Charts/ComposedChart', component: ComposedChart };

const quarterly = [
  { quarter: 'Q1', revenue: 4200, target: 4000, growth: 5 },
  { quarter: 'Q2', revenue: 5100, target: 4800, growth: 12 },
  { quarter: 'Q3', revenue: 6200, target: 5500, growth: 18 },
  { quarter: 'Q4', revenue: 7100, target: 6300, growth: 22 },
];

export const RevenueWithTargetAndGrowth = {
  render: () => (
    <ComposedChart
      xKey="quarter"
      data={quarterly}
      yFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
      series={[
        { key: 'target', label: 'Target', color: 'neutral', type: 'area' },
        { key: 'revenue', label: 'Revenue', color: 'primary', type: 'bar' },
        { key: 'growth', label: 'Growth %', color: 'success', type: 'line' },
      ]}
    />
  ),
};
