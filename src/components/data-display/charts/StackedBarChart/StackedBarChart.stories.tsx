import { StackedBarChart } from './StackedBarChart';

export default { title: 'Data display/Charts/StackedBarChart', component: StackedBarChart };

const data = [
  { quarter: 'Q1', enterprise: 240, smb: 180, freemium: 90 },
  { quarter: 'Q2', enterprise: 320, smb: 210, freemium: 120 },
  { quarter: 'Q3', enterprise: 410, smb: 260, freemium: 150 },
  { quarter: 'Q4', enterprise: 480, smb: 320, freemium: 200 },
];

export const Default = {
  render: () => (
    <StackedBarChart
      xKey="quarter"
      data={data}
      series={[
        { key: 'enterprise', label: 'Enterprise', color: 'primary' },
        { key: 'smb', label: 'SMB', color: 'success' },
        { key: 'freemium', label: 'Free', color: 'warning' },
      ]}
    />
  ),
};
