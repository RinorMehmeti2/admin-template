import { Card, ExampleBlock, Stat } from '@/components/data-display';
import { KPIS } from '../data';

const code = `<section
  aria-label="Key metrics"
  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
>
  {KPIS.map((kpi) => (
    <Card key={kpi.label} variant="outlined" className="p-5">
      <Stat
        label={kpi.label}
        value={kpi.value}
        delta={kpi.delta}
        deltaLabel={kpi.deltaLabel}
        icon={kpi.icon}
      />
    </Card>
  ))}
</section>`;

export function KpiGrid() {
  return (
    <ExampleBlock
      title="KPI grid"
      description="Outlined cards with Stat primitive — responsive 1/2/4 column layout."
      code={code}
    >
      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {KPIS.map((kpi) => (
          <Card key={kpi.label} variant="outlined" className="p-5">
            <Stat
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaLabel={kpi.deltaLabel}
              icon={kpi.icon}
            />
          </Card>
        ))}
      </section>
    </ExampleBlock>
  );
}
