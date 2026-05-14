import { ClipboardCheck, Download, GraduationCap, ListChecks, School } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/data-display/Card';
import { AreaChart } from '@/components/data-display/charts/AreaChart';
import { BarChart } from '@/components/data-display/charts/BarChart';
import { ChartContainer } from '@/components/data-display/charts/ChartContainer';
import { Select } from '@/components/forms/Select';
import { Label } from '@/components/forms/Label';
import { SimsPageHeader } from '../components/SimsPageHeader';
import { SimsStatCard } from '../components/SimsStatCard';
import { MOCK_STATS } from '../data';

export function StatisticsPage() {
  const stats = MOCK_STATS;
  const totalRoles = stats.roleSplit.reduce((a, b) => a + b.value, 0);

  return (
    <>
      <SimsPageHeader
        title="Statistics"
        description="Key indicators for the current academic year."
        actions={
          <>
            <div className="space-y-1">
              <Label htmlFor="sims-year">Year</Label>
              <Select id="sims-year" selectSize="sm" defaultValue={2026} className="w-36">
                <option value={2026}>2025–2026</option>
                <option value={2025}>2024–2025</option>
              </Select>
            </div>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SimsStatCard
          Icon={School}
          label="Enrolled students"
          value={stats.enrolled.toLocaleString()}
          trend="up"
          trendValue="+1.2%"
        />
        <SimsStatCard
          Icon={GraduationCap}
          label="Teachers"
          value={stats.teachers}
          trend="flat"
          trendValue="0"
        />
        <SimsStatCard
          Icon={ListChecks}
          label="Active classes"
          value={stats.classes}
          trend="up"
          trendValue="+4"
        />
        <SimsStatCard
          Icon={ClipboardCheck}
          label="Avg. attendance"
          value={`${stats.avgAttendance}%`}
          trend="down"
          trendValue="-0.3%"
        />
      </div>

      <ChartContainer>
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Enrollment trend</CardTitle>
              <CardDescription>Active students by month</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart
                data={[...stats.enrollmentTrend]}
                series={[{ key: 'value', label: 'Students', color: 'primary' }]}
                xKey="label"
                height={240}
                smooth
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Users by role</CardTitle>
              <CardDescription>{totalRoles.toLocaleString()} total accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {stats.roleSplit.map((r) => {
                  const pct = (r.value / Math.max(totalRoles, 1)) * 100;
                  return (
                    <li key={r.label}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="font-medium">{r.label}</span>
                        <span className="font-mono text-xs text-foreground-muted">
                          {r.value.toLocaleString()} · {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: r.color }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Attendance by grade</CardTitle>
            <CardDescription>Year-to-date average attendance percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[...stats.attendanceByGrade]}
              series={[{ key: 'value', label: 'Attendance %', color: 'success' }]}
              xKey="label"
              height={240}
              yFormatter={(n) => `${n}%`}
            />
          </CardContent>
        </Card>
      </ChartContainer>
    </>
  );
}
