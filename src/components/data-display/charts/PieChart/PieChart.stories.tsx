import { PieChart } from './PieChart';

export default { title: 'Data display/Charts/PieChart', component: PieChart };

const sources = [
  { name: 'Direct', value: 4200, color: 'primary' as const },
  { name: 'Search', value: 5100, color: 'success' as const },
  { name: 'Social', value: 2400, color: 'warning' as const },
  { name: 'Email', value: 1800, color: 'info' as const },
  { name: 'Referral', value: 1100, color: 'danger' as const },
];

export const Default = {
  render: () => (
    <PieChart
      xKey="name"
      data={sources}
      series={[{ key: 'value', label: 'Visits' }]}
    />
  ),
};

export const AutoColors = {
  render: () => (
    <PieChart
      xKey="name"
      data={sources.map(({ color: _color, ...rest }) => ({ ...rest }))}
      series={[{ key: 'value', label: 'Visits' }]}
    />
  ),
};
