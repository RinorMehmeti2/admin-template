import { ExampleBlock } from '@/components/data-display';
import { BarChart } from '@/components/data-display/charts';
import { traffic } from '../data';

const code = `<BarChart
  xKey="source"
  data={traffic}
  series={[{ key: 'visits', label: 'Visits', color: 'info' }]}
  height={280}
/>`;

export function TrafficChart() {
  return (
    <ExampleBlock
      title="Traffic by source"
      description="Visits grouped by acquisition channel."
      code={code}
    >
      <BarChart
        xKey="source"
        data={traffic}
        series={[{ key: 'visits', label: 'Visits', color: 'info' }]}
        height={280}
      />
    </ExampleBlock>
  );
}
