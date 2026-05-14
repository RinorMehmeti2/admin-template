import { useState } from 'react';
import { LayoutGrid, Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/data-display/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Switch } from '@/components/forms/Switch';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_MODULES, type SimsModule } from '../data';

export function ModulesPage() {
  const { toast } = useToast();
  const [list, setList] = useState<SimsModule[]>(MOCK_MODULES);
  const [selectedId, setSelectedId] = useState<number>(MOCK_MODULES[0]?.id ?? 0);
  const selected = list.find((m) => m.id === selectedId);

  const toggleEnabled = (id: number) => {
    setList((l) => l.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
    const mod = list.find((m) => m.id === id);
    if (mod !== undefined) toast.success(`${mod.name} ${mod.enabled ? 'disabled' : 'enabled'}`);
  };

  return (
    <>
      <SimsPageHeader
        title="Modules & Operations"
        description="Enable system modules and configure the operations they expose."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => toast.info('New module wizard opened')}
          >
            New Module
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[340px_1fr]">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>
              {list.filter((m) => m.enabled).length} of {list.length} enabled
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {list.map((m) => {
                const active = m.id === selectedId;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                        active ? 'bg-primary/5' : '',
                        m.enabled ? '' : 'opacity-60',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                          m.enabled
                            ? 'bg-primary/10 text-primary'
                            : 'bg-surface-muted text-foreground-subtle',
                        )}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{m.name}</p>
                        <p className="text-xs text-foreground-muted">
                          {m.operations.length} operations
                        </p>
                      </div>
                      <Switch
                        checked={m.enabled}
                        onChange={() => toggleEnabled(m.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                        aria-label={`Toggle ${m.name}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {selected !== undefined ? (
          <Card variant="outlined">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{selected.name}</CardTitle>
                  <CardDescription>{selected.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selected.enabled ? 'success' : 'neutral'} size="sm">
                  {selected.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Badge variant="neutral" size="sm" className="font-mono">
                  {selected.key}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Operations</p>
                <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Add operation
                </Button>
              </div>
              <Table size="dense">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 80 }}>#</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead className="text-right" style={{ width: 130 }}>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.operations.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>
                        <span className="font-mono text-xs text-foreground-muted">
                          {op.id.toString().padStart(3, '0')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{op.key}</span>
                      </TableCell>
                      <TableCell className="font-medium">{op.label}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <IconButton aria-label="Edit operation" variant="ghost" size="sm">
                            <Edit className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton aria-label="Delete operation" variant="ghost" size="sm">
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
