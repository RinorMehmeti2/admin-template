import { CircleAlert, CircleCheck, CircleMinus, CirclePlus, RefreshCw } from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '@/components/primitives/Badge';
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
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_DRIFT, type DriftState } from '../data';

interface DriftPalette {
  label: string;
  tone: 'neutral' | 'warning' | 'danger' | 'info';
  Icon: ComponentType<{ className?: string }>;
}

const PALETTE: Record<DriftState, DriftPalette> = {
  match: { label: 'Match', tone: 'neutral', Icon: CircleCheck },
  mismatch: { label: 'Mismatch', tone: 'warning', Icon: CircleAlert },
  missing: { label: 'Missing', tone: 'danger', Icon: CircleMinus },
  extra: { label: 'Extra', tone: 'info', Icon: CirclePlus },
};

const STATES: ReadonlyArray<DriftState> = ['match', 'mismatch', 'missing', 'extra'];

export function SchemaDriftPage() {
  const totals = MOCK_DRIFT.reduce<Record<DriftState, number>>(
    (acc, r) => ({ ...acc, [r.state]: (acc[r.state] ?? 0) + 1 }),
    { match: 0, mismatch: 0, missing: 0, extra: 0 },
  );

  return (
    <>
      <SimsPageHeader
        title="Schema Drift"
        description="Compare expected database schema against actual."
        actions={
          <>
            <span className="text-xs text-foreground-muted">Last checked: May 5, 2026</span>
            <IconButton aria-label="Refresh" variant="outline" size="md">
              <RefreshCw className="h-4 w-4" />
            </IconButton>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATES.map((k) => {
          const v = PALETTE[k];
          const Icon = v.Icon;
          return (
            <Card key={k} variant="outlined">
              <CardContent className="flex items-center gap-3 py-3">
                <Badge variant={v.tone} size="sm">
                  <Icon className="mr-1 inline h-3 w-3" />
                  {v.label}
                </Badge>
                <span className="ml-auto text-2xl font-bold tabular-nums">{totals[k]}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="rounded-md border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table.Column</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead className="text-right" style={{ width: 130 }}>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DRIFT.map((r, i) => {
              const p = PALETTE[r.state];
              return (
                <TableRow key={i}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {r.table}.<span className="text-primary">{r.column}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        r.state === 'extra'
                          ? 'font-mono text-xs text-foreground-subtle'
                          : 'font-mono text-xs'
                      }
                    >
                      {r.expected}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        r.state === 'missing'
                          ? 'font-mono text-xs text-foreground-subtle'
                          : 'font-mono text-xs'
                      }
                    >
                      {r.actual}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={p.tone} size="sm">
                      {p.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
