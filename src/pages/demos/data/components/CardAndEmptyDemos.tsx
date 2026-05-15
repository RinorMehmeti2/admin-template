import { Inbox, Plus } from 'lucide-react';
import { Card, EmptyState, ExampleBlock } from '@/components/data-display';
import { Button } from '@/components/primitives/Button';

const variantsCode = `<div className="grid grid-cols-3 gap-3">
  {(['default', 'outlined', 'elevated'] as const).map((v) => (
    <Card key={v} variant={v} className="p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
        {v}
      </p>
      <p className="mt-1 text-sm">Body</p>
    </Card>
  ))}
</div>`;

const emptyCode = `<EmptyState
  icon={<Inbox className="h-6 w-6" />}
  title="No invoices yet"
  description="Create your first invoice or import a CSV from your previous tool."
  action={
    <>
      <Button variant="outline">Import CSV</Button>
      <Button leftIcon={<Plus className="h-4 w-4" />}>New invoice</Button>
    </>
  }
/>`;

export function CardAndEmptyDemos() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ExampleBlock
        title="Card variants"
        description="default, outlined, elevated"
        code={variantsCode}
      >
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
      </ExampleBlock>

      <ExampleBlock
        title="EmptyState"
        description="Used when a list, table, or section has nothing to show"
        code={emptyCode}
      >
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
      </ExampleBlock>
    </section>
  );
}
