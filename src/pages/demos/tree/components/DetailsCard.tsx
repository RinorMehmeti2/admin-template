import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { Badge } from '@/components/primitives/Badge';
import type { TreeNode } from '@/components/data-display/TreeView';
import type { FileMeta } from '../model';

interface DetailsCardProps {
  selectedNode: TreeNode<FileMeta> | undefined;
}

export function DetailsCard({ selectedNode }: DetailsCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{selectedNode?.label ?? 'Nothing selected'}</CardTitle>
          <CardDescription>
            {selectedNode === undefined
              ? 'Pick a file or folder from the tree to see details.'
              : selectedNode.id}
          </CardDescription>
        </div>
        {selectedNode?.data?.kind !== undefined ? (
          <Badge variant="neutral" size="sm">
            {selectedNode.data.kind}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        {selectedNode === undefined ? (
          <p className="text-sm text-foreground-muted">
            Try keyboard nav: <kbd className="rounded bg-surface-muted px-1.5 py-0.5">↑</kbd>{' '}
            <kbd className="rounded bg-surface-muted px-1.5 py-0.5">↓</kbd>{' '}
            <kbd className="rounded bg-surface-muted px-1.5 py-0.5">→</kbd>{' '}
            <kbd className="rounded bg-surface-muted px-1.5 py-0.5">←</kbd>{' '}
            <kbd className="rounded bg-surface-muted px-1.5 py-0.5">Home</kbd>{' '}
            <kbd className="rounded bg-surface-muted px-1.5 py-0.5">End</kbd>{' '}
            <kbd className="rounded bg-surface-muted px-1.5 py-0.5">*</kbd>, or type a file
            name.
          </p>
        ) : (
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
            <dt className="text-foreground-muted">Path</dt>
            <dd className="font-mono text-xs">{selectedNode.id}</dd>
            <dt className="text-foreground-muted">Kind</dt>
            <dd>{selectedNode.data?.kind}</dd>
            {selectedNode.data?.size !== undefined ? (
              <>
                <dt className="text-foreground-muted">Size</dt>
                <dd>{selectedNode.data.size}</dd>
              </>
            ) : null}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
