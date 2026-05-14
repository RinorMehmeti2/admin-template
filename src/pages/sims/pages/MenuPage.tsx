import { Fragment, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Edit,
  GripVertical,
  LayoutDashboard,
  RotateCcw,
  Save,
} from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/data-display/Card';
import { Switch } from '@/components/forms/Switch';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_MENU, type SimsMenuNode } from '../data';
import { MENU_ICONS } from '../nav';

export function MenuPage() {
  const { toast } = useToast();
  const [tree, setTree] = useState<SimsMenuNode[]>(MOCK_MENU);

  const toggleVisible = (id: number) => {
    setTree((t) =>
      t.map((n) => {
        if (n.id === id) return { ...n, visible: !n.visible };
        if (n.children !== undefined)
          return {
            ...n,
            children: n.children.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)),
          };
        return n;
      }),
    );
  };

  const move = (id: number, dir: -1 | 1, parentId?: number) => {
    const cloneSort = (arr: SimsMenuNode[]): SimsMenuNode[] => {
      const i = arr.findIndex((x) => x.id === id);
      if (i < 0) return arr;
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const a = arr[i];
      const b = arr[j];
      if (a === undefined || b === undefined) return arr;
      const next = [...arr];
      next[i] = b;
      next[j] = a;
      return next;
    };
    setTree((t) => {
      if (parentId === undefined) return cloneSort(t);
      return t.map((n) =>
        n.id === parentId ? { ...n, children: cloneSort(n.children ?? []) } : n,
      );
    });
  };

  const totalNodes = tree.reduce((acc, n) => acc + 1 + (n.children?.length ?? 0), 0);
  const visibleNodes = tree.reduce(
    (acc, n) => acc + (n.visible ? 1 : 0) + (n.children?.filter((c) => c.visible).length ?? 0),
    0,
  );

  return (
    <>
      <SimsPageHeader
        title="Menu"
        description="Configure the order, grouping, and visibility of sidebar items."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={() => {
                setTree(MOCK_MENU);
                toast.info('Menu reset to defaults');
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => toast.success('Menu saved')}
            >
              Save
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_320px]">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Sidebar items</CardTitle>
            <CardDescription>
              {visibleNodes} visible · {totalNodes - visibleNodes} hidden · {totalNodes} total
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tree.map((n) => (
              <Fragment key={n.id}>
                <Row node={n} depth={0} toggleVisible={toggleVisible} move={(d) => move(n.id, d)} />
                {n.children?.map((c) => (
                  <Row
                    key={c.id}
                    node={c}
                    depth={1}
                    toggleVisible={toggleVisible}
                    move={(d) => move(c.id, d, n.id)}
                  />
                ))}
              </Fragment>
            ))}
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>What students and staff will see</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border bg-background p-2">
              {tree
                .filter((n) => n.visible)
                .map((n) => {
                  const Icon = MENU_ICONS[n.iconKey] ?? LayoutDashboard;
                  return (
                    <Fragment key={n.id}>
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <Icon className="h-4 w-4 text-foreground" />
                        <span className="text-sm font-semibold">{n.label}</span>
                      </div>
                      {n.children
                        ?.filter((c) => c.visible)
                        .map((c) => {
                          const CIcon = MENU_ICONS[c.iconKey] ?? LayoutDashboard;
                          return (
                            <div key={c.id} className="flex items-center gap-2 py-1 pl-8 pr-2">
                              <CIcon className="h-3.5 w-3.5 text-foreground-muted" />
                              <span className="text-xs text-foreground-muted">{c.label}</span>
                            </div>
                          );
                        })}
                    </Fragment>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

interface RowProps {
  node: SimsMenuNode;
  depth: number;
  toggleVisible: (id: number) => void;
  move: (dir: -1 | 1) => void;
}

function Row({ node, depth, toggleVisible, move }: RowProps) {
  const Icon = MENU_ICONS[node.iconKey] ?? LayoutDashboard;
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-border px-4 py-2.5',
        node.visible ? '' : 'opacity-55',
      )}
      style={{ paddingLeft: `${16 + depth * 24}px` }}
    >
      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-foreground-subtle" />
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{node.label}</p>
        <p className="truncate font-mono text-xs text-foreground-muted">{node.path}</p>
      </div>
      {node.children !== undefined ? (
        <Badge variant="neutral" size="sm">
          {node.children.length} child
        </Badge>
      ) : null}
      <IconButton aria-label="Move up" variant="ghost" size="sm" onClick={() => move(-1)}>
        <ArrowUp className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton aria-label="Move down" variant="ghost" size="sm" onClick={() => move(1)}>
        <ArrowDown className="h-3.5 w-3.5" />
      </IconButton>
      <label className="flex items-center gap-1.5 text-xs">
        <Switch
          checked={node.visible}
          onChange={() => toggleVisible(node.id)}
          aria-label={node.visible ? 'Hide' : 'Show'}
        />
        <span className="text-foreground-muted">{node.visible ? 'Visible' : 'Hidden'}</span>
      </label>
      <IconButton aria-label="Edit" variant="ghost" size="sm">
        <Edit className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  );
}
