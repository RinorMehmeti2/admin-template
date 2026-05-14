import { useCallback, useState } from 'react';
import { Download, FolderInput, Pencil, Share2, Trash2 } from 'lucide-react';
import { ExampleBlock } from '@/components/data-display';
import {
  FileExplorer,
  type FileExplorerAction,
  type FileNode,
} from '@/components/data-display/FileExplorer';
import { useToast } from '@/context/ToastProvider';
import { mockFsRoot, mockLoadChildren, setChildrenAt } from './mockFs';

const ACTIONS: ReadonlyArray<FileExplorerAction> = [
  { id: 'open', label: 'Open' },
  {
    id: 'share',
    label: 'Share',
    icon: <Share2 className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: 'rename',
    label: 'Rename',
    icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
    disabled: (sel) => sel.length !== 1,
  },
  {
    id: 'move',
    label: 'Move',
    icon: <FolderInput className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: 'download',
    label: 'Download',
    icon: <Download className="h-4 w-4" aria-hidden="true" />,
    hidden: (sel) => sel.length === 0 || sel.some((s) => s.kind === 'folder'),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4 text-danger" aria-hidden="true" />,
    separatorBefore: true,
  },
];

const code = `const ACTIONS: ReadonlyArray<FileExplorerAction> = [
  { id: 'open', label: 'Open' },
  { id: 'share', label: 'Share', icon: <Share2 className="h-4 w-4" /> },
  {
    id: 'rename',
    label: 'Rename',
    icon: <Pencil className="h-4 w-4" />,
    disabled: (sel) => sel.length !== 1,
  },
  { id: 'move', label: 'Move', icon: <FolderInput className="h-4 w-4" /> },
  {
    id: 'download',
    label: 'Download',
    icon: <Download className="h-4 w-4" />,
    hidden: (sel) => sel.length === 0 || sel.some((s) => s.kind === 'folder'),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4 text-danger" />,
    separatorBefore: true,
  },
];

<div className="h-[640px] w-full overflow-hidden border-t border-border">
  <FileExplorer
    root={root}
    actions={ACTIONS}
    onLoadChildren={(node) => {
      setRoot((prev) => setChildrenAt(prev, node.id, 'pending'));
      setTimeout(() => {
        const resolved = mockLoadChildren(node.id);
        setRoot((prev) => setChildrenAt(prev, node.id, resolved ?? []));
      }, 600);
    }}
    onAction={(id, selected) => {
      const names = selected.map((s) => s.name).join(', ');
      toast({
        type: id === 'delete' ? 'error' : 'info',
        title: labelFor(id),
        description: selected.length === 1 ? names : \`\${selected.length} items: \${names}\`,
      });
    }}
  />
</div>`;

export function FileExplorerPage() {
  const { toast } = useToast();
  const [root, setRoot] = useState<FileNode>(mockFsRoot);

  const handleLoad = useCallback((node: FileNode) => {
    setRoot((prev) => setChildrenAt(prev, node.id, 'pending'));
    // Simulate a network round-trip.
    setTimeout(() => {
      const resolved = mockLoadChildren(node.id);
      setRoot((prev) => setChildrenAt(prev, node.id, resolved ?? []));
    }, 600);
  }, []);

  const handleAction = useCallback(
    (id: string, selected: FileNode[]) => {
      const names = selected.map((s) => s.name).join(', ');
      toast({
        type: id === 'delete' ? 'error' : 'info',
        title: labelFor(id),
        description: selected.length === 1 ? names : `${selected.length} items: ${names}`,
      });
    },
    [toast],
  );

  return (
    <div className="space-y-4">
      <ExampleBlock
        title="File explorer"
        description="SplitLayout + TreeView + Breadcrumbs + ContextMenu, composed against an in-memory mock filesystem. Right-click items for actions, toggle list/grid, and try the lazy public/images and archive folders."
        code={code}
      >
        <div className="-mx-6 -mb-6 h-[640px] w-full overflow-hidden border-t border-border">
          <FileExplorer
            root={root}
            actions={ACTIONS}
            onLoadChildren={handleLoad}
            onAction={handleAction}
          />
        </div>
      </ExampleBlock>
    </div>
  );
}

function labelFor(actionId: string): string {
  const map: Record<string, string> = {
    open: 'Opened',
    share: 'Shared',
    rename: 'Rename requested',
    move: 'Move requested',
    download: 'Download started',
    delete: 'Deleted',
  };
  return map[actionId] ?? actionId;
}
