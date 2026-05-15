import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Input } from '@/components/forms/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Stat } from '@/components/data-display/Stat';
import { Card } from '@/components/data-display/Card';
import { useToast } from '@/context/ToastProvider';
import { Section } from '../../_shared/Section';

interface Revision {
  id: string;
  title: string;
  pending: boolean;
}

async function fakeCommit(): Promise<void> {
  await new Promise((r) => setTimeout(r, 700));
  // 1 in 4 commits "fails" — flip the threshold for predictable demos.
  if (Math.random() < 0.25) throw new Error('Commit failed');
}

const CODE = `const handleAdd = async () => {
  const title = draft.trim();
  if (title.length === 0) return;
  const id = \`rev-\${Date.now().toString(36)}\`;
  const optimistic: Revision = { id, title, pending: true };
  // Optimistically reflect both row + counter.
  setRows((cur) => [optimistic, ...cur]);
  setCommitted((c) => c + 1);
  setDraft('');
  try {
    await fakeCommit();
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, pending: false } : r)));
  } catch {
    // Roll back on failure.
    setRows((cur) => cur.filter((r) => r.id !== id));
    setCommitted((c) => c - 1);
    toast.error('Commit failed — rolled back');
  }
};

<div className="flex gap-2">
  <Input
    placeholder="Revision title…"
    value={draft}
    onChange={(e) => setDraft(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleAdd();
      }
    }}
  />
  <Button
    type="button"
    variant="primary"
    leftIcon={<Plus className="h-4 w-4" />}
    onClick={() => void handleAdd()}
  >
    Add
  </Button>
</div>
<Table size="dense">
  <TableHeader>
    <TableRow>
      <TableHead>Revision</TableHead>
      <TableHead className="text-right">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.title}</TableCell>
        <TableCell className="text-right">
          {row.pending ? 'Committing…' : 'Committed'}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
<Stat label="Draft revisions" value={String(committed)} />`;

export function OptimisticUpdateSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [draft, setDraft] = useState('');
  const [rows, setRows] = useState<Revision[]>([]);
  const [committed, setCommitted] = useState(0);

  const handleAdd = async () => {
    const title = draft.trim();
    if (title.length === 0) return;
    const id = `rev-${Date.now().toString(36)}`;
    const optimistic: Revision = { id, title, pending: true };
    // Optimistically reflect both row + counter.
    setRows((cur) => [optimistic, ...cur]);
    setCommitted((c) => c + 1);
    setDraft('');
    try {
      await fakeCommit();
      setRows((cur) => cur.map((r) => (r.id === id ? { ...r, pending: false } : r)));
    } catch {
      // Roll back on failure.
      setRows((cur) => cur.filter((r) => r.id !== id));
      setCommitted((c) => c - 1);
      toast.error('Commit failed — rolled back');
    }
  };

  return (
    <Section
      id="optimistic"
      title={t('forms.async.optimistic.title')}
      description={t('forms.async.optimistic.description')}
      code={CODE}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Revision title…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => void handleAdd()}
            >
              Add
            </Button>
          </div>
          <div className="rounded-md border border-border bg-surface">
            <Table size="dense" containerClassName="rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead>Revision</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Remove</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-xs text-foreground-muted">
                      No revisions yet — add one above. ~25% will simulate a failure and roll back.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.title}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            row.pending
                              ? 'inline-flex items-center text-xs text-warning'
                              : 'inline-flex items-center text-xs text-success-foreground'
                          }
                        >
                          {row.pending ? 'Committing…' : 'Committed'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove ${row.title}`}
                          onClick={() => {
                            setRows((cur) => cur.filter((r) => r.id !== row.id));
                            setCommitted((c) => Math.max(0, c - 1));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <Card variant="outlined" className="p-4">
          <Stat label="Draft revisions" value={String(committed)} />
          <p className="mt-2 text-xs text-foreground-muted">
            Counter increments optimistically. Failures decrement it back.
          </p>
        </Card>
      </div>
    </Section>
  );
}
