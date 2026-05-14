import { ExampleBlock } from '@/components/data-display';
import { DonutChart } from '@/components/data-display/charts';
import { planMix } from '../data';

const code = `<DonutChart
  xKey="name"
  data={planMix}
  series={[{ key: 'value', label: 'Subscribers' }]}
  height={280}
  centerLabel={{ value: totalSubscribers.toLocaleString(), sub: 'subscribers' }}
/>`;

export function PlanMixChart() {
  const totalSubscribers = planMix.reduce((sum, p) => sum + p.value, 0);

  return (
    <ExampleBlock
      title="Plan mix"
      description="Subscriber distribution across plan tiers."
      code={code}
    >
      <DonutChart
        xKey="name"
        data={planMix}
        series={[{ key: 'value', label: 'Subscribers' }]}
        height={280}
        centerLabel={{ value: totalSubscribers.toLocaleString(), sub: 'subscribers' }}
      />
    </ExampleBlock>
  );
}
