import { Separator, Skeleton, Spinner } from '@/components/primitives';
import { Row, Section } from './Section';

export function SpinnerSkeletonSection() {
  return (
    <Section title="Spinner & Skeleton">
      <Row label="Spinner">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner className="text-primary" />
        <Spinner className="text-danger" />
      </Row>
      <Separator className="my-1" />
      <Row label="Skeleton">
        <div className="w-full max-w-sm space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </Row>
    </Section>
  );
}
