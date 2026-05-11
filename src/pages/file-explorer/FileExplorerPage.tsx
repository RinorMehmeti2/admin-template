import { useCallback, useState } from 'react';
import { Download, FolderInput, Pencil, Share2, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
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
      <Card>
        <CardHeader>
          <CardTitle>File explorer</CardTitle>
          <CardDescription>
            SplitLayout + TreeView + Breadcrumbs + ContextMenu, composed against an in-memory
            mock filesystem. Right-click items for actions, toggle list/grid, and try the lazy
            <code className="mx-1 rounded bg-surface-muted px-1 py-0.5 text-xs">public/images</code>
            and
            <code className="mx-1 rounded bg-surface-muted px-1 py-0.5 text-xs">archive</code>
            folders.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[640px] w-full overflow-hidden border-t border-border">
            <FileExplorer
              root={root}
              actions={ACTIONS}
              onLoadChildren={handleLoad}
              onAction={handleAction}
            />
          </div>
        </CardContent>
      </Card>
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
