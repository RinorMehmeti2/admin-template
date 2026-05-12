import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { DonutChart } from '@/components/data-display/charts/DonutChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
import { PLAN_BREAKDOWN } from '../data';

export function PlanAndNotes() {
  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-3">
      <Card variant="outlined" className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Plan mix</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={PLAN_BREAKDOWN}
            xKey="name"
            series={[{ key: 'value', label: 'Customers' }]}
            height={260}
          />
        </CardContent>
      </Card>

      <Card variant="outlined" className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Notes by department</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="finance">
            <TabsList>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="ops">Operations</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
            </TabsList>
            <TabsContent value="finance">
              <h3 className="text-sm font-semibold">Finance</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Revenue exceeded plan by 6.2%. Two overdue invoices over 30 days outstanding; see{' '}
                <a href="https://example.com/finance/aging">aging report</a> for follow-up.
              </p>
            </TabsContent>
            <TabsContent value="ops">
              <h3 className="text-sm font-semibold">Operations</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Disk usage on prod-3 trending up; provisioning ticket{' '}
                <a href="https://example.com/tickets/4218">OPS-4218</a> filed.
              </p>
            </TabsContent>
            <TabsContent value="sales">
              <h3 className="text-sm font-semibold">Sales</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Pipeline coverage at 3.1x for Q3. Stark Industries upgrade closed at $24k MRR.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
