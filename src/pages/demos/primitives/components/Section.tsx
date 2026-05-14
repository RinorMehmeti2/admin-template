import type { ReactNode } from 'react';
import { ExampleBlock } from '@/components/data-display/ExampleBlock';

export function Section({
  title,
  description,
  code,
  children,
}: {
  title: string;
  description?: string;
  code?: string;
  children: ReactNode;
}) {
  return (
    <ExampleBlock title={title} description={description} code={code}>
      {children}
    </ExampleBlock>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-4 py-2 first:pt-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
