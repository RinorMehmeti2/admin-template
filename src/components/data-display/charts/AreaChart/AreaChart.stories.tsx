import { AreaChart } from './AreaChart';

export default { title: 'Data display/Charts/AreaChart', component: AreaChart };

const data = [
  { day: 'Mon', signups: 240, churn: 80 },
  { day: 'Tue', signups: 300, churn: 90 },
  { day: 'Wed', signups: 520, churn: 110 },
  { day: 'Thu', signups: 480, churn: 120 },
  { day: 'Fri', signups: 610, churn: 140 },
  { day: 'Sat', signups: 380, churn: 70 },
  { day: 'Sun', signups: 220, churn: 50 },
];

export const Default = {
  render: () => (
    <AreaChart
      xKey="day"
      data={data}
      series={[{ key: 'signups', label: 'Sign-ups', color: 'primary' }]}
    />
  ),
};

export const Stacked = {
  render: () => (
    <AreaChart
      xKey="day"
      data={data}
      stacked
      series={[
        { key: 'signups', label: 'Sign-ups', color: 'primary' },
        { key: 'churn', label: 'Churn', color: 'danger' },
      ]}
    />
  ),
};
