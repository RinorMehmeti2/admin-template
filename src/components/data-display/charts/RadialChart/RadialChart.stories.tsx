import { RadialChart } from './RadialChart';

export default { title: 'Data display/Charts/RadialChart', component: RadialChart };

const utilisation = [
  { name: 'CPU', value: 72, color: 'primary' as const },
  { name: 'RAM', value: 56, color: 'info' as const },
  { name: 'GPU', value: 84, color: 'warning' as const },
  { name: 'Disk', value: 38, color: 'success' as const },
];

export const Default = {
  render: () => (
    <RadialChart
      xKey="name"
      data={utilisation}
      series={[{ key: 'value', label: 'Usage %' }]}
      domainMax={100}
      yFormatter={(v) => `${v}%`}
    />
  ),
};
