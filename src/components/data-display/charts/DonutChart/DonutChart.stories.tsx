import { DonutChart } from './DonutChart';

export default { title: 'Data display/Charts/DonutChart', component: DonutChart };

const plans = [
  { name: 'Pro', value: 4200 },
  { name: 'Team', value: 5100 },
  { name: 'Free', value: 2400 },
];

const total = plans.reduce((sum, p) => sum + p.value, 0);

export const Default = {
  render: () => (
    <DonutChart xKey="name" data={plans} series={[{ key: 'value', label: 'Subscribers' }]} />
  ),
};

export const WithCenterLabel = {
  render: () => (
    <DonutChart
      xKey="name"
      data={plans}
      series={[{ key: 'value', label: 'Subscribers' }]}
      centerLabel={{ value: total.toLocaleString(), sub: 'total subscribers' }}
    />
  ),
};
