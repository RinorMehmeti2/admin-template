import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { TreeView } from '@/components/data-display/TreeView';
import { TREE } from '../data';
import type { FileMeta } from '../model';
import { Row } from './Row';

interface FilesCardProps {
  selected: string[];
  setSelected: (ids: string[]) => void;
}

export function FilesCard({ selected, setSelected }: FilesCardProps) {
  return (
    <Card variant="outlined" className="h-fit">
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <CardDescription>
          2 folders, {TREE.filter((n) => n.data?.kind !== 'folder').length} files at root
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TreeView<FileMeta>
          items={TREE}
          selectionMode="single"
          defaultExpandedIds={['src', 'src/components']}
          selectedIds={selected}
          onSelectedChange={setSelected}
          renderItem={(ctx) => <Row ctx={ctx} />}
          aria-label="Project files"
        />
      </CardContent>
    </Card>
  );
}
