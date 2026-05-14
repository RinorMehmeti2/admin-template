import { useState } from 'react';
import { Download, Edit, Plus, Table2, Trash2 } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { MOCK_LOOKUPS, type SimsLookupTable } from '../data';

export function LookupTablesPage() {
  const { toast } = useToast();
  const [list, setList] = useState<SimsLookupTable[]>(MOCK_LOOKUPS);
  const [selectedId, setSelectedId] = useState<number>(MOCK_LOOKUPS[0]?.id ?? 0);
  const selected = list.find((t) => t.id === selectedId);

  const toggleRow = (tableId: number, code: string) => {
    setList((l) =>
      l.map((t) =>
        t.id === tableId
          ? {
              ...t,
              rows: t.rows.map((r) => (r.code === code ? { ...r, enabled: !r.enabled } : r)),
            }
          : t,
      ),
    );
    const tbl = list.find((t) => t.id === tableId);
    const row = tbl?.rows.find((r) => r.code === code);
    if (tbl !== undefined && row !== undefined) {
      toast.info(`${tbl.name}: ${row.code} ${row.enabled ? 'disabled' : 'enabled'}`);
    }
  };

  return (
    <>
      <SimsPageHeader
        title="Lookup Tables"
        description="Reference data used by forms across the system."
        actions={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New table
          </Button>
        }
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_1fr]">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Tables</CardTitle>
            <CardDescription>{list.length} tables</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {list.map((t) => {
                const active = t.id === selectedId;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                        active ? 'bg-primary/5' : '',
                      )}
                    >
                      <Table2 className="h-4 w-4 text-foreground-muted" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-foreground-muted">{t.rows.length} rows</p>
                      </div>
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
              <div>
                <CardTitle>{selected.name}</CardTitle>
                <CardDescription>{selected.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                  Export
                </Button>
                <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Add row
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table size="dense">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 120 }}>Code</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead className="text-right" style={{ width: 80 }}>
                      Sort
                    </TableHead>
                    <TableHead className="text-center" style={{ width: 110 }}>
                      Enabled
                    </TableHead>
                    <TableHead className="text-right" style={{ width: 100 }} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...selected.rows]
                    .sort((a, b) => a.sort - b.sort)
                    .map((r) => (
                      <TableRow key={r.code} className={r.enabled ? '' : 'opacity-55'}>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold">{r.code}</span>
                        </TableCell>
                        <TableCell>{r.label}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-xs">{r.sort}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={r.enabled}
                            onChange={() => toggleRow(selected.id, r.code)}
                            aria-label={`Toggle ${r.code}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <IconButton aria-label="Edit" variant="ghost" size="sm">
                              <Edit className="h-3.5 w-3.5" />
                            </IconButton>
                            <IconButton aria-label="Delete" variant="ghost" size="sm">
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
