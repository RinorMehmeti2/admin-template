import { Card, Stat } from '@/components/data-display';
import { KPIS } from '../data';

export function KpiGrid() {
  return (
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
  );
}
