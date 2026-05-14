import { useMemo, useState } from 'react';
import {
  CalendarClock,
  Download,
  FileText,
  GraduationCap,
  LineChart,
  Plus,
  RefreshCw,
  Search,
  Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Card, CardContent } from '@/components/data-display/Card';
import { Input } from '@/components/forms/Input';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_REPORTS, type ReportCategory, type ReportFormat } from '../data';

const CATEGORIES: ReadonlyArray<'All' | ReportCategory> = [
  'All',
  'Academic',
  'Financial',
  'Operations',
];

const CATEGORY_ICON: Record<ReportCategory, ComponentType<{ className?: string }>> = {
  Academic: GraduationCap,
  Financial: Wallet,
  Operations: LineChart,
};

const FORMAT_TONE: Record<ReportFormat, 'danger' | 'success' | 'info'> = {
  PDF: 'danger',
  XLSX: 'success',
  CSV: 'info',
};

export function ReportsPage() {
  const { toast } = useToast();
  const [category, setCategory] = useState<'All' | ReportCategory>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      MOCK_REPORTS.filter(
        (r) =>
          (category === 'All' || r.category === category) &&
          (search === '' || r.name.toLowerCase().includes(search.toLowerCase())),
      ),
    [category, search],
  );

  return (
    <>
      <SimsPageHeader
        title="Reports"
        description="Generated reports and one-click exports."
        actions={
          <>
            <Button variant="outline" leftIcon={<CalendarClock className="h-4 w-4" />}>
              Schedule
            </Button>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Generate report
            </Button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          leftIcon={<Search className="h-4 w-4" />}
          placeholder="Search reports…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          inputSize="sm"
          className="w-80"
        />
        <div className="flex gap-1">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-surface text-foreground-muted hover:bg-surface-muted',
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
        <div className="ml-auto">
          <Badge variant="primary">
            {filtered.length} report{filtered.length === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((r) => {
          const Icon = CATEGORY_ICON[r.category] ?? FileText;
          return (
            <Card key={r.id} variant="outlined">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <Badge size="sm" variant={FORMAT_TONE[r.format]}>
                        {r.format}
                      </Badge>
                    </div>
                    <p className="mb-1.5 text-xs text-foreground-muted">{r.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                      <span>
                        <span className="font-mono">{r.rows.toLocaleString()}</span> rows
                      </span>
                      <span>·</span>
                      <span>Generated {r.lastGenerated}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <IconButton
                      aria-label="Download"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toast.success(`${r.name}.${r.format.toLowerCase()} download started`)
                      }
                    >
                      <Download className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      aria-label="Regenerate"
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.success(`${r.name} queued for regeneration`)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
