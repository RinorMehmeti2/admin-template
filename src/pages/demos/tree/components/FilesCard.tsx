import { ExampleBlock } from '@/components/data-display';
import { TreeView } from '@/components/data-display/TreeView';
import { TREE } from '../data';
import type { FileMeta } from '../model';
import { Row } from './Row';

interface FilesCardProps {
  selected: string[];
  setSelected: (ids: string[]) => void;
}

const code = `<TreeView<FileMeta>
  items={TREE}
  selectionMode="single"
  defaultExpandedIds={['src', 'src/components']}
  selectedIds={selected}
  onSelectedChange={setSelected}
  renderItem={(ctx) => <Row ctx={ctx} />}
  aria-label="Project files"
/>`;

export function FilesCard({ selected, setSelected }: FilesCardProps) {
  return (
    <ExampleBlock
      title="Files"
      description={`2 folders, ${TREE.filter((n) => n.data?.kind !== 'folder').length} files at root`}
      code={code}
      className="h-fit"
    >
      <TreeView<FileMeta>
        items={TREE}
        selectionMode="single"
        defaultExpandedIds={['src', 'src/components']}
        selectedIds={selected}
        onSelectedChange={setSelected}
        renderItem={(ctx) => <Row ctx={ctx} />}
        aria-label="Project files"
      />
    </ExampleBlock>
  );
}
