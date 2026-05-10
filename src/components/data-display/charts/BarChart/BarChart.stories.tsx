import { BarChart } from './BarChart';

export default { title: 'Data display/Charts/BarChart', component: BarChart };

const traffic = [
  { source: 'Direct', visits: 4200 },
  { source: 'Search', visits: 5100 },
  { source: 'Social', visits: 2400 },
  { source: 'Email', visits: 1800 },
  { source: 'Referral', visits: 1100 },
];

const grouped = [
  { week: 'W1', desktop: 320, mobile: 540, tablet: 80 },
  { week: 'W2', desktop: 360, mobile: 600, tablet: 110 },
  { week: 'W3', desktop: 410, mobile: 580, tablet: 90 },
  { week: 'W4', desktop: 450, mobile: 690, tablet: 120 },
];

export const Single = {
  render: () => (
    <BarChart
      xKey="source"
      data={traffic}
      series={[{ key: 'visits', label: 'Visits', color: 'primary' }]}
    />
  ),
};

export const Grouped = {
  render: () => (
    <BarChart
      xKey="week"
      data={grouped}
      series={[
        { key: 'desktop', label: 'Desktop', color: 'primary' },
        { key: 'mobile', label: 'Mobile', color: 'success' },
        { key: 'tablet', label: 'Tablet', color: 'warning' },
      ]}
    />
  ),
};

export const Horizontal = {
  render: () => (
    <BarChart
      xKey="source"
      data={traffic}
      orientation="vertical"
      series={[{ key: 'visits', label: 'Visits', color: 'info' }]}
    />
  ),
};
