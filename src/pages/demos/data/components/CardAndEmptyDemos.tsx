import { Inbox, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@/components/data-display';
import { Button } from '@/components/primitives/Button';

export function CardAndEmptyDemos() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Card variants demo */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Card variants</CardTitle>
          <CardDescription>default, outlined, elevated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(['default', 'outlined', 'elevated'] as const).map((v) => (
              <Card key={v} variant={v} className="p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  {v}
                </p>
                <p className="mt-1 text-sm">Body</p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* EmptyState demo */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>EmptyState</CardTitle>
          <CardDescription>Used when a list, table, or section has nothing to show</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No invoices yet"
            description="Create your first invoice or import a CSV from your previous tool."
            action={
              <>
                <Button variant="outline">Import CSV</Button>
                <Button leftIcon={<Plus className="h-4 w-4" />}>New invoice</Button>
              </>
            }
          />
        </CardContent>
      </Card>
    </section>
  );
}
