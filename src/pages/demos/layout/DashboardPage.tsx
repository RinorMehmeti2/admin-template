import { Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
import { Progress } from '@/components/feedback/Progress';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { DemoBreadcrumbs, DemoCard } from './LayoutDemo';

export function DashboardPage() {
  return (
    <div>
      <div className="mb-3">
        <DemoBreadcrumbs items={[{ label: 'Dashboard' }]} />
      </div>
      <SimsPageHeader title="Dashboard" description="Overview of activity in the last 30 days." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DemoCard title="Active users" value="2,418" hint="↑ 12% vs last month" />
        <DemoCard title="Revenue" value="$47.2k" hint="↑ 4.1% vs last month" />
        <DemoCard title="Conversion" value="3.4%" hint="↓ 0.2% vs last month" />
        <DemoCard title="Errors" value="0.07%" hint="↓ 0.01% vs last month" />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <ul className="divide-y divide-border rounded-md border border-border bg-surface">
              {[
                {
                  who: 'Ada Lovelace',
                  what: 'updated billing settings',
                  when: '2 min ago',
                  up: true,
                },
                { who: 'Bob Marley', what: 'invited 3 new users', when: '1 hr ago', up: true },
                { who: 'Cher', what: 'archived the Q1 report', when: '3 hr ago', up: false },
                {
                  who: 'Diego Velazquez',
                  what: 'changed plan to Pro',
                  when: 'yesterday',
                  up: true,
                },
              ].map((it, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <Activity className="h-4 w-4 text-foreground-subtle" />
                  <span className="font-medium">{it.who}</span>
                  <span className="text-foreground-muted">{it.what}</span>
                  <span className="ml-auto text-xs text-foreground-subtle">{it.when}</span>
                  {it.up ? (
                    <ArrowUp className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-danger" />
                  )}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="health">
            <div className="space-y-3 rounded-md border border-border bg-surface p-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">CPU</span>
                  <span className="font-medium">42%</span>
                </div>
                <Progress value={42} variant="success" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Memory</span>
                  <span className="font-medium">71%</span>
                </div>
                <Progress value={71} variant="warning" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Disk</span>
                  <span className="font-medium">93%</span>
                </div>
                <Progress value={93} variant="danger" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="billing">
            <div className="rounded-md border border-border bg-surface p-4 text-sm text-foreground-muted">
              Pro plan · renews May 12, 2026 · $49 / month
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
