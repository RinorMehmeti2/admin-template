import { ExampleBlock } from '@/components/data-display';
import { LineChart } from '@/components/data-display/charts';
import { monthly } from '../data';

const fmtUSD = (n: number): string =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

const code = `const fmtUSD = (n: number): string =>
  n >= 1000 ? \`$\${(n / 1000).toFixed(1)}k\` : \`$\${n.toLocaleString()}\`;

<LineChart
  xKey="month"
  data={monthly}
  yFormatter={fmtUSD}
  series={[
    { key: 'revenue', label: 'Revenue', color: 'primary' },
    { key: 'orders', label: 'Orders', color: 'success' },
  ]}
  height={320}
/>`;

export function RevenueChart() {
  return (
    <ExampleBlock
      title="Revenue & order volume"
      description="Trailing 12 months — dual-series line chart."
      code={code}
    >
      <LineChart
        xKey="month"
        data={monthly}
        yFormatter={fmtUSD}
        series={[
          { key: 'revenue', label: 'Revenue', color: 'primary' },
          { key: 'orders', label: 'Orders', color: 'success' },
        ]}
        height={320}
      />
    </ExampleBlock>
  );
}
