import { useMemo, useState } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Card, CardContent } from '@/components/data-display/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Pagination } from '@/components/navigation/Pagination';
import { Input } from '@/components/forms/Input';
import { Label } from '@/components/forms/Label';
import { Select } from '@/components/forms/Select';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_LOGS, type LogLevel } from '../data';

const LEVELS: ReadonlyArray<LogLevel> = ['Info', 'Warning', 'Error'];
const TONE: Record<LogLevel, 'info' | 'warning' | 'danger'> = {
  Info: 'info',
  Warning: 'warning',
  Error: 'danger',
};
const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function LogsPage() {
  const [levels, setLevels] = useState<LogLevel[]>([...LEVELS]);
  const [user, setUser] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const filtered = useMemo(
    () =>
      MOCK_LOGS.filter(
        (l) => levels.includes(l.level) && (user === '' || l.user.includes(user.toLowerCase())),
      ),
    [levels, user],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  return (
    <>
      <SimsPageHeader
        title="Logs"
        description="Audit trail of system events."
        actions={
          <>
            <IconButton aria-label="Refresh" variant="outline" size="md">
              <RefreshCw className="h-4 w-4" />
            </IconButton>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export CSV
            </Button>
          </>
        }
      />
      <Card variant="outlined" className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground-muted">Level</p>
            <div className="flex gap-1">
              {LEVELS.map((l) => {
                const on = levels.includes(l);
                const tone = TONE[l];
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLevels((s) => (on ? s.filter((x) => x !== l) : [...s, l]));
                      setPage(1);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      on
                        ? tone === 'info'
                          ? 'bg-info text-info-foreground'
                          : tone === 'warning'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-danger text-danger-foreground'
                        : 'border border-border bg-surface text-foreground-muted hover:bg-surface-muted',
                    )}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sims-log-user">User</Label>
            <Input
              id="sims-log-user"
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Filter by username…"
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                setPage(1);
              }}
              inputSize="sm"
              className="w-72"
            />
          </div>
        </CardContent>
      </Card>
      <div className="rounded-md border border-border bg-surface">
        <Table size="dense">
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 170 }}>Timestamp</TableHead>
              <TableHead style={{ width: 100 }}>Level</TableHead>
              <TableHead style={{ width: 180 }}>User</TableHead>
              <TableHead style={{ width: 170 }}>Action</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <span className="font-mono text-xs text-foreground-muted">
                    {new Date(l.ts).toLocaleString('en', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge size="sm" variant={TONE[l.level]}>
                    {l.level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{l.user}</span>
                </TableCell>
                <TableCell className="font-medium">{l.action}</TableCell>
                <TableCell>
                  <span className="block max-w-md truncate text-sm text-foreground-muted">
                    {l.message}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm">
          <div className="flex items-center gap-2 text-foreground-muted">
            <span>Rows per page:</span>
            <Select
              selectSize="sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="w-20"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            <span>
              {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)}{' '}
              of {filtered.length}
            </span>
          </div>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}
