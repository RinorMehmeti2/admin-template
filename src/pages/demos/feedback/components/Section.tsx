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
  children: React.ReactNode;
}) {
  return (
    <ExampleBlock title={title} description={description} code={code}>
      {children}
    </ExampleBlock>
  );
}
