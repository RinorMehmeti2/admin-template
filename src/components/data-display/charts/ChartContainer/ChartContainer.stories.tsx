import { ChartContainer } from './ChartContainer';
import { LineChart } from '../LineChart';
import { BarChart } from '../BarChart';

export default { title: 'Data display/Charts/ChartContainer', component: ChartContainer };

const data = [
  { month: 'Jan', revenue: 1200, expenses: 800 },
  { month: 'Feb', revenue: 1900, expenses: 950 },
  { month: 'Mar', revenue: 2100, expenses: 1100 },
  { month: 'Apr', revenue: 1850, expenses: 1000 },
  { month: 'May', revenue: 2400, expenses: 1300 },
  { month: 'Jun', revenue: 2700, expenses: 1450 },
];

export const Wraps2Charts = {
  render: () => (
    <ChartContainer className="grid gap-6 sm:grid-cols-2">
      <LineChart
        xKey="month"
        data={data}
        series={[{ key: 'revenue', label: 'Revenue', color: 'primary' }]}
        height={240}
      />
      <BarChart
        xKey="month"
        data={data}
        series={[{ key: 'expenses', label: 'Expenses', color: 'warning' }]}
        height={240}
      />
    </ChartContainer>
  ),
};
