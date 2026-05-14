import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
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
import { Select } from '@/components/forms/Select';
import { Label } from '@/components/forms/Label';
import { cn } from '@/lib/cn';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { MOCK_HOLIDAYS_2026 } from '../data';

const YEARS = [2024, 2025, 2026, 2027];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function HolidaysPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4);

  // For demo, all years show the 2026 set.
  const holidays = MOCK_HOLIDAYS_2026;

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const out: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push(d);
    }
    return out;
  }, [year, month]);

  const holidayDates = new Set(holidays.map((h) => h.date));

  return (
    <>
      <SimsPageHeader title="Holidays" description="Configure school holiday calendar by year." />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="sims-year">Year</Label>
          <Select
            id="sims-year"
            selectSize="sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-32"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
        <div className="ml-auto">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Add Holiday
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_380px]">
        <Card variant="outlined">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {new Date(year, month, 1).toLocaleString('en', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <div className="flex gap-1">
                <IconButton
                  aria-label="Previous month"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMonth((m) => Math.max(0, m - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </IconButton>
                <IconButton
                  aria-label="Next month"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMonth((m) => Math.min(11, m + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="py-1.5 text-center text-xs font-semibold text-foreground-muted"
                >
                  {d}
                </div>
              ))}
              {days.map((d, i) => {
                const inMonth = d.getMonth() === month;
                const iso = d.toISOString().slice(0, 10);
                const isHoliday = holidayDates.has(iso);
                const today = iso === '2026-05-05';
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-md text-sm font-medium',
                      isHoliday
                        ? 'bg-primary/15 font-bold text-primary'
                        : inMonth
                          ? 'text-foreground'
                          : 'text-foreground-subtle',
                      today && !isHoliday ? 'ring-1 ring-primary' : '',
                    )}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Holidays in {year}</CardTitle>
            <CardDescription>{holidays.length} entries</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {holidays.map((h) => {
                const d = new Date(h.date);
                return (
                  <li key={h.date} className="flex items-center gap-3 px-4 py-2.5">
                    <Badge variant="primary" size="sm" className="shrink-0">
                      {d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </Badge>
                    <p className="flex-1 truncate text-sm font-medium">{h.name}</p>
                    <IconButton aria-label="Delete" variant="ghost" size="sm">
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
