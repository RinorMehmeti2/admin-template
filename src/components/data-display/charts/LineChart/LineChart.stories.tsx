import { LineChart } from './LineChart';

export default { title: 'Data display/Charts/LineChart', component: LineChart };

const monthly = [
  { month: 'Jan', revenue: 4200, expenses: 2100 },
  { month: 'Feb', revenue: 5100, expenses: 2200 },
  { month: 'Mar', revenue: 6200, expenses: 2400 },
  { month: 'Apr', revenue: 5800, expenses: 2300 },
  { month: 'May', revenue: 7100, expenses: 2700 },
  { month: 'Jun', revenue: 7800, expenses: 2900 },
  { month: 'Jul', revenue: 8400, expenses: 3000 },
  { month: 'Aug', revenue: 9200, expenses: 3200 },
  { month: 'Sep', revenue: 9700, expenses: 3300 },
  { month: 'Oct', revenue: 10500, expenses: 3500 },
  { month: 'Nov', revenue: 11200, expenses: 3600 },
  { month: 'Dec', revenue: 12100, expenses: 3800 },
];

const usd = (n: number): string => `$${(n / 1000).toFixed(1)}k`;

export const Single = {
  render: () => (
    <LineChart
      xKey="month"
      data={monthly}
      yFormatter={usd}
      series={[{ key: 'revenue', label: 'Revenue', color: 'primary' }]}
    />
  ),
};

export const Multiple = {
  render: () => (
    <LineChart
      xKey="month"
      data={monthly}
      yFormatter={usd}
      series={[
        { key: 'revenue', label: 'Revenue', color: 'primary' },
        { key: 'expenses', label: 'Expenses', color: 'danger' },
      ]}
    />
  ),
};

export const WithDots = {
  render: () => (
    <LineChart
      xKey="month"
      data={monthly}
      yFormatter={usd}
      series={[{ key: 'revenue', label: 'Revenue', color: 'success' }]}
      showDots
      smooth={false}
    />
  ),
};
